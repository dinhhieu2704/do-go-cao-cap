/**
 * MỘC GIA TINH HOA — Admin Dashboard Controller
 * Pure Vanilla JavaScript & Google Sheets API v4 CRUD Engine
 */

const DEFAULT_SPREADSHEET_ID = '1fvhKI-B-HP02--JdDvRy9QevfgyPo6Ekko34X-8ToKA';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const STATE = {
  spreadsheetId: localStorage.getItem('admin_sheet_id') || DEFAULT_SPREADSHEET_ID,
  clientId: localStorage.getItem('admin_client_id') || '',
  activeView: 'products',
  tokenClient: null,
  accessToken: null,
  userProfile: null,
  sheetsMeta: new Map(),
  data: {
    products: [],
    categories: [],
    settings: []
  },
  editItem: null,
  deleteTarget: null
};

// ============================================================================
// 1. INITIALIZATION & GOOGLE IDENTITY SERVICES / GAPI SETUP
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  initUIEventListeners();
  loadSavedConfig();
  checkGapiAndGsi();
});

function checkGapiAndGsi() {
  let gapiLoaded = false;
  let gsiLoaded = false;

  const interval = setInterval(() => {
    if (window.gapi && !gapiLoaded) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC]
          });
          gapiLoaded = true;
        } catch (err) {
          console.error('Lỗi khởi tạo GAPI client:', err);
        }
      });
    }

    if (window.google && window.google.accounts && window.google.accounts.oauth2 && !gsiLoaded) {
      initGsiClient();
      gsiLoaded = true;
    }

    if (gapiLoaded && gsiLoaded) {
      clearInterval(interval);
    }
  }, 200);

  setTimeout(() => clearInterval(interval), 10000);
}

function initGsiClient() {
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) return;
  if (!STATE.clientId) return;

  try {
    STATE.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: STATE.clientId,
      scope: SCOPES,
      callback: handleTokenResponse
    });
  } catch (err) {
    console.error('Lỗi khởi tạo GIS TokenClient:', err);
  }
}

async function handleTokenResponse(response) {
  if (response.error) {
    hideLoading();
    showToast(`Đăng nhập thất bại: ${response.error}`, 'error');
    return;
  }

  STATE.accessToken = response.access_token;
  window.gapi.client.setToken(response);

  // Fetch Google User Info
  try {
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    });
    if (userInfoRes.ok) {
      STATE.userProfile = await userInfoRes.json();
      updateUserProfileUI(STATE.userProfile);
    }
  } catch (e) {
    console.warn('Không thể lấy chi tiết profile user:', e);
  }

  // Switch to Dashboard
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'flex';

  showToast('Đăng nhập Google thành công! Đang tải cơ sở dữ liệu...', 'success');

  // Load all sheets data
  await loadAllSheetsData();
}

function updateUserProfileUI(user) {
  if (!user) return;
  const nameEl = document.getElementById('header-user-name');
  const emailEl = document.getElementById('header-user-email');
  const avatarEl = document.getElementById('header-user-avatar');

  if (nameEl) nameEl.textContent = user.name || 'Quản Trị Viên';
  if (emailEl) emailEl.textContent = user.email || '';
  if (avatarEl) {
    if (user.picture) {
      avatarEl.innerHTML = `<img src="${escapeHTML(user.picture)}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    } else {
      avatarEl.textContent = (user.name || 'MG').slice(0, 2).toUpperCase();
    }
  }
}

// ============================================================================
// 2. UI EVENT LISTENERS
// ============================================================================

function initUIEventListeners() {
  // Login Button
  const loginBtn = document.getElementById('btn-google-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (!STATE.clientId) {
        showToast('Vui lòng thiết lập Google OAuth Client ID trước khi đăng nhập.', 'warning');
        document.getElementById('login-config-panel')?.classList.add('open');
        return;
      }
      if (!STATE.tokenClient) {
        initGsiClient();
      }
      if (STATE.tokenClient) {
        showLoading('Đang mở cửa sổ đăng nhập Google...');
        STATE.tokenClient.requestAccessToken({ prompt: '' });
      } else {
        showToast('Chưa khởi tạo được Google Client. Vui lòng kiểm tra Client ID.', 'error');
      }
    });
  }

  // Config Toggle & Save
  const toggleConfigBtn = document.getElementById('btn-toggle-config');
  const configPanel = document.getElementById('login-config-panel');
  if (toggleConfigBtn && configPanel) {
    toggleConfigBtn.addEventListener('click', () => {
      configPanel.classList.toggle('open');
    });
  }

  const saveConfigBtn = document.getElementById('btn-save-config');
  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', () => {
      const sheetIdInput = document.getElementById('cfg-sheet-id').value.trim();
      const clientIdInput = document.getElementById('cfg-client-id').value.trim();

      if (sheetIdInput) {
        STATE.spreadsheetId = sheetIdInput;
        localStorage.setItem('admin_sheet_id', sheetIdInput);
      }
      if (clientIdInput) {
        STATE.clientId = clientIdInput;
        localStorage.setItem('admin_client_id', clientIdInput);
        initGsiClient();
      }

      showToast('Đã lưu cấu hình Google Sheet & Client ID thành công!', 'success');
      configPanel.classList.remove('open');
    });
  }

  // Navigation Tabs (Sidebar)
  document.querySelectorAll('.nav-item-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (STATE.accessToken && window.google?.accounts?.oauth2?.revoke) {
        window.google.accounts.oauth2.revoke(STATE.accessToken, () => {});
      }
      STATE.accessToken = null;
      STATE.userProfile = null;
      document.getElementById('dashboard-screen').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
      showToast('Đã đăng xuất khỏi trang quản trị.', 'info');
    });
  }

  // Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('btn-mobile-sidebar');
  const sidebar = document.getElementById('admin-sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Table Search Filter
  const searchInput = document.getElementById('table-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCurrentTableView(searchInput.value.trim().toLowerCase());
    });
  }

  // Reload Table Button
  const reloadBtn = document.getElementById('btn-reload-table');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      loadAllSheetsData();
    });
  }

  // Modal Open Create
  const openCreateBtn = document.getElementById('btn-open-create');
  if (openCreateBtn) {
    openCreateBtn.addEventListener('click', () => {
      openCrudModal(null);
    });
  }

  // Modal Close / Cancel
  const closeModalBtn = document.getElementById('btn-close-modal');
  const cancelModalBtn = document.getElementById('btn-cancel-modal');
  const crudModal = document.getElementById('crud-modal');
  [closeModalBtn, cancelModalBtn].forEach(b => {
    if (b && crudModal) {
      b.addEventListener('click', () => {
        crudModal.classList.remove('open');
      });
    }
  });

  // Modal Form Submit (Create or Update)
  const crudForm = document.getElementById('crud-form');
  if (crudForm) {
    crudForm.addEventListener('submit', handleFormSubmit);
  }

  // Delete Modal Confirmation
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
  const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
  const confirmModal = document.getElementById('confirm-modal');
  if (cancelDeleteBtn && confirmModal) {
    cancelDeleteBtn.addEventListener('click', () => {
      confirmModal.classList.remove('open');
      STATE.deleteTarget = null;
    });
  }
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', executeDeleteTarget);
  }
}

function loadSavedConfig() {
  const sheetIdInput = document.getElementById('cfg-sheet-id');
  const clientIdInput = document.getElementById('cfg-client-id');
  const dbInfoEl = document.getElementById('sidebar-db-info');

  if (sheetIdInput && STATE.spreadsheetId) sheetIdInput.value = STATE.spreadsheetId;
  if (clientIdInput && STATE.clientId) clientIdInput.value = STATE.clientId;
  if (dbInfoEl && STATE.spreadsheetId) {
    dbInfoEl.textContent = `ID: ${STATE.spreadsheetId.slice(0, 10)}...${STATE.spreadsheetId.slice(-6)}`;
  }
}

function switchView(viewName) {
  STATE.activeView = viewName;

  // Sidebar active class
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Breadcrumbs & Title
  const breadcrumb = document.getElementById('breadcrumb-active-view');
  const title = document.getElementById('toolbar-view-title');
  const desc = document.getElementById('toolbar-view-desc');
  const createLabel = document.getElementById('btn-create-label');

  if (viewName === 'products') {
    if (breadcrumb) breadcrumb.textContent = 'SẢN PHẨM';
    if (title) title.textContent = 'Quản Lý Kiệt Tác Gỗ';
    if (desc) desc.textContent = 'Quản trị danh sách kiệt tác gỗ trực tiếp trên sheet Products';
    if (createLabel) createLabel.textContent = '+ Thêm Sản Phẩm';
  } else if (viewName === 'categories') {
    if (breadcrumb) breadcrumb.textContent = 'DANH MỤC';
    if (title) title.textContent = 'Quản Lý Danh Mục';
    if (desc) desc.textContent = 'Quản lý các nhóm không gian nội thất trên sheet Categories';
    if (createLabel) createLabel.textContent = '+ Thêm Danh Mục';
  } else if (viewName === 'settings') {
    if (breadcrumb) breadcrumb.textContent = 'CẤU HÌNH';
    if (title) title.textContent = 'Cấu Hình Hệ Thống';
    if (desc) desc.textContent = 'Thiết lập thông tin thương hiệu, hotline, zalo trên sheet Settings';
    if (createLabel) createLabel.textContent = '+ Thêm Cấu Hình';
  }

  // Clear search and render table
  const searchInput = document.getElementById('table-search-input');
  if (searchInput) searchInput.value = '';
  renderCurrentTableView();
}

// ============================================================================
// 3. GOOGLE SHEETS API V4 INTEGRATION (CRUD ENGINE)
// ============================================================================

async function loadAllSheetsData() {
  showLoading('Đang tải dữ liệu từ Google Sheets API v4...');
  try {
    // 1. Fetch Spreadsheet Metadata (to get numeric sheetId for batchUpdate deleteDimension)
    const metaRes = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: STATE.spreadsheetId
    });
    
    STATE.sheetsMeta.clear();
    metaRes.result.sheets.forEach(s => {
      STATE.sheetsMeta.set(s.properties.title, s.properties.sheetId);
    });

    // 2. Read values from the 3 sheets using spreadsheets.values.get
    const [settingsRes, categoriesRes, productsRes] = await Promise.all([
      window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: STATE.spreadsheetId,
        range: 'Settings!A1:Z'
      }),
      window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: STATE.spreadsheetId,
        range: 'Categories!A1:Z'
      }),
      window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: STATE.spreadsheetId,
        range: 'Products!A1:Z'
      })
    ]);

    // Parse Settings
    STATE.data.settings = parseSheetRows(settingsRes.result.values, ['Key', 'Value', 'Mô Tả']);
    
    // Parse Categories
    STATE.data.categories = parseSheetRows(categoriesRes.result.values, ['Cat_ID', 'Tên Danh Mục', 'Mô Tả Danh Mục']);
    
    // Parse Products
    STATE.data.products = parseSheetRows(productsRes.result.values, ['Prod_ID', 'Cat_ID', 'Tên Sản Phẩm', 'Giá VNĐ', 'Hình Ảnh URL', 'Chi Tiết Sản Phẩm']);

    // Update Stats
    document.getElementById('stat-products-count').textContent = STATE.data.products.length;
    document.getElementById('stat-categories-count').textContent = STATE.data.categories.length;
    document.getElementById('stat-settings-count').textContent = STATE.data.settings.length;

    renderCurrentTableView();
    hideLoading();
    showToast('Tải dữ liệu từ Google Sheets thành công!', 'success');
  } catch (err) {
    hideLoading();
    handleSheetsError(err, 'Tải dữ liệu thất bại');
  }
}

function parseSheetRows(values, defaultHeaders) {
  if (!values || values.length === 0) return [];

  const rawHeaders = values[0].map(h => (h || '').trim());
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const rowVals = values[i] || [];
    if (rowVals.length === 0 || rowVals.every(v => !v || v.trim() === '')) continue;

    const rowObj = {
      _rowIndex: i + 1, // 1-indexed row number in Google Sheets
      _rawValues: rowVals
    };

    rawHeaders.forEach((h, colIdx) => {
      rowObj[h] = rowVals[colIdx] !== undefined ? String(rowVals[colIdx]).trim() : '';
    });

    // Provide normalized aliases
    if (rowObj.Product_ID && !rowObj.Prod_ID) rowObj.Prod_ID = rowObj.Product_ID;
    if (rowObj.Name && !rowObj['Tên Sản Phẩm']) rowObj['Tên Sản Phẩm'] = rowObj.Name;
    if (rowObj.Price_Display && !rowObj['Giá VNĐ']) rowObj['Giá VNĐ'] = rowObj.Price_Display;
    if (rowObj.Image_Main && !rowObj['Hình Ảnh URL']) rowObj['Hình Ảnh URL'] = rowObj.Image_Main;
    if (rowObj.Short_Desc && !rowObj['Chi Tiết Sản Phẩm']) rowObj['Chi Tiết Sản Phẩm'] = rowObj.Short_Desc;
    if (rowObj.Full_Desc && !rowObj['Chi Tiết Sản Phẩm']) rowObj['Chi Tiết Sản Phẩm'] = rowObj.Full_Desc;

    if (rowObj.Cat_Name && !rowObj['Tên Danh Mục']) rowObj['Tên Danh Mục'] = rowObj.Cat_Name;
    if (rowObj.Description && !rowObj['Mô Tả Danh Mục']) rowObj['Mô Tả Danh Mục'] = rowObj.Description;
    if (rowObj.Description && !rowObj['Mô Tả']) rowObj['Mô Tả'] = rowObj.Description;

    rows.push(rowObj);
  }

  return rows;
}

// ============================================================================
// 4. DATA TABLE RENDERING
// ============================================================================

function renderCurrentTableView(searchQuery = '') {
  const tableHead = document.getElementById('data-table-head');
  const tableBody = document.getElementById('data-table-body');
  if (!tableHead || !tableBody) return;

  const view = STATE.activeView;
  let items = STATE.data[view] || [];

  if (searchQuery) {
    items = items.filter(item => {
      return Object.values(item).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(searchQuery)
      );
    });
  }

  if (view === 'products') {
    tableHead.innerHTML = `
      <tr>
        <th style="width: 110px;">Prod_ID</th>
        <th style="width: 70px;">Hình Ảnh</th>
        <th>Tên Sản Phẩm</th>
        <th>Danh Mục</th>
        <th style="width: 140px;">Giá VNĐ</th>
        <th>Chi Tiết Sản Phẩm</th>
        <th style="width: 100px; text-align: center;">Hành Động</th>
      </tr>
    `;

    if (items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="table-empty-state"><span class="material-symbols-outlined">inventory_2</span><p>Không có sản phẩm nào phù hợp</p></td></tr>`;
      return;
    }

    tableBody.innerHTML = items.map(item => {
      const catObj = STATE.data.categories.find(c => c.Cat_ID === item.Cat_ID);
      const catName = catObj ? (catObj['Tên Danh Mục'] || catObj.Cat_ID) : (item.Cat_ID || 'Chưa phân loại');
      const imgSrc = (item['Hình Ảnh URL'] && !item['Hình Ảnh URL'].includes('[link removed]'))
        ? item['Hình Ảnh URL']
        : 'images/default-woodcraft.svg';

      return `
        <tr>
          <td><strong style="color: var(--color-primary); font-family: monospace;">${escapeHTML(item.Prod_ID || item.Product_ID)}</strong></td>
          <td>
            <img src="${escapeHTML(imgSrc)}"
                 alt="${escapeHTML(item['Tên Sản Phẩm'] || '')}"
                 class="table-img-thumb"
                 onerror="this.onerror=null; this.src='images/default-woodcraft.svg';" />
          </td>
          <td><strong>${escapeHTML(item['Tên Sản Phẩm'] || item.Name || '')}</strong></td>
          <td><span class="badge-cat">${escapeHTML(catName)}</span></td>
          <td style="font-weight: 700; color: var(--color-secondary-dark);">${escapeHTML(item['Giá VNĐ'] || 'Liên Hệ')}</td>
          <td style="color: var(--color-text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(item['Chi Tiết Sản Phẩm'] || '')}">
            ${escapeHTML(item['Chi Tiết Sản Phẩm'] || '')}
          </td>
          <td>
            <div class="table-actions-cell" style="justify-content: center;">
              <button type="button" class="btn-table-action edit" onclick="window.adminApp.onEditItem('${escapeHTML(item.Prod_ID || item.Product_ID)}')" title="Sửa dòng này">
                <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
              </button>
              <button type="button" class="btn-table-action delete" onclick="window.adminApp.onConfirmDelete('${escapeHTML(item.Prod_ID || item.Product_ID)}')" title="Xóa dòng này">
                <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } else if (view === 'categories') {
    tableHead.innerHTML = `
      <tr>
        <th style="width: 180px;">Cat_ID</th>
        <th>Tên Danh Mục</th>
        <th>Mô Tả Danh Mục</th>
        <th style="width: 100px; text-align: center;">Hành Động</th>
      </tr>
    `;

    if (items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="table-empty-state"><span class="material-symbols-outlined">category</span><p>Không có danh mục nào</p></td></tr>`;
      return;
    }

    tableBody.innerHTML = items.map(item => `
      <tr>
        <td><strong style="color: var(--color-primary); font-family: monospace;">${escapeHTML(item.Cat_ID)}</strong></td>
        <td><strong>${escapeHTML(item['Tên Danh Mục'] || item.Cat_Name || '')}</strong></td>
        <td style="color: var(--color-text-muted);">${escapeHTML(item['Mô Tả Danh Mục'] || item.Description || '')}</td>
        <td>
          <div class="table-actions-cell" style="justify-content: center;">
            <button type="button" class="btn-table-action edit" onclick="window.adminApp.onEditItem('${escapeHTML(item.Cat_ID)}')" title="Sửa">
              <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
            </button>
            <button type="button" class="btn-table-action delete" onclick="window.adminApp.onConfirmDelete('${escapeHTML(item.Cat_ID)}')" title="Xóa">
              <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } else if (view === 'settings') {
    tableHead.innerHTML = `
      <tr>
        <th style="width: 200px;">Key</th>
        <th>Value</th>
        <th>Mô Tả</th>
        <th style="width: 100px; text-align: center;">Hành Động</th>
      </tr>
    `;

    if (items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="table-empty-state"><span class="material-symbols-outlined">tune</span><p>Chưa có thông số cấu hình</p></td></tr>`;
      return;
    }

    tableBody.innerHTML = items.map(item => `
      <tr>
        <td><strong style="color: var(--color-primary); font-family: monospace;">${escapeHTML(item.Key)}</strong></td>
        <td><code style="background: var(--color-surface-container); padding: 0.2rem 0.4rem; font-family: monospace;">${escapeHTML(item.Value)}</code></td>
        <td style="color: var(--color-text-muted);">${escapeHTML(item['Mô Tả'] || '')}</td>
        <td>
          <div class="table-actions-cell" style="justify-content: center;">
            <button type="button" class="btn-table-action edit" onclick="window.adminApp.onEditItem('${escapeHTML(item.Key)}')" title="Sửa">
              <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
            </button>
            <button type="button" class="btn-table-action delete" onclick="window.adminApp.onConfirmDelete('${escapeHTML(item.Key)}')" title="Xóa">
              <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
}

// ============================================================================
// 5. MODAL FORM BUILDER & SUBMISSION (CREATE & UPDATE)
// ============================================================================

function openCrudModal(itemToEdit = null) {
  STATE.editItem = itemToEdit;
  const modal = document.getElementById('crud-modal');
  const title = document.getElementById('modal-form-title');
  const fieldsContainer = document.getElementById('modal-form-fields');
  const view = STATE.activeView;

  if (!modal || !title || !fieldsContainer) return;

  const isEdit = !!itemToEdit;

  if (view === 'products') {
    title.textContent = isEdit ? `Chỉnh Sửa Sản Phẩm: ${itemToEdit.Prod_ID || itemToEdit.Product_ID}` : 'Thêm Kiệt Tác Mới';
    
    // Category options from loaded categories
    const catOptions = STATE.data.categories.map(c => {
      const selected = (itemToEdit && itemToEdit.Cat_ID === c.Cat_ID) ? 'selected' : '';
      return `<option value="${escapeHTML(c.Cat_ID)}" ${selected}>${escapeHTML(c['Tên Danh Mục'] || c.Cat_ID)}</option>`;
    }).join('');

    const defaultImg = (itemToEdit && itemToEdit['Hình Ảnh URL']) ? itemToEdit['Hình Ảnh URL'] : 'images/default-woodcraft.svg';

    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="field-prod-id">Mã Sản Phẩm (Prod_ID):</label>
        <input type="text" id="field-prod-id" class="form-control" value="${escapeHTML(itemToEdit?.Prod_ID || itemToEdit?.Product_ID || '')}" placeholder="Tự động tạo nếu để trống" ${isEdit ? 'readonly style="background:#eee;"' : ''}>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-prod-cat">Danh Mục Kiệt Tác: <span class="required">*</span></label>
        <select id="field-prod-cat" class="form-control" required>
          ${catOptions || '<option value="all">Tất Cả Kiệt Tác</option>'}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-prod-name">Tên Kiệt Tác Gỗ: <span class="required">*</span></label>
        <input type="text" id="field-prod-name" class="form-control" value="${escapeHTML(itemToEdit?.['Tên Sản Phẩm'] || itemToEdit?.Name || '')}" placeholder="Ví dụ: Bàn Ăn Hoàng Gia Gỗ Gõ Đỏ Pachy" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-prod-price">Giá Niêm Yết (VNĐ): <span class="required">*</span></label>
        <input type="text" id="field-prod-price" class="form-control" value="${escapeHTML(itemToEdit?.['Giá VNĐ'] || itemToEdit?.Price_Display || '')}" placeholder="Ví dụ: 485.000.000 VNĐ" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-prod-image">Hình Ảnh URL (Link trực tiếp / Drive):</label>
        <input type="url" id="field-prod-image" class="form-control" value="${escapeHTML(itemToEdit?.['Hình Ảnh URL'] || itemToEdit?.Image_Main || '')}" placeholder="https://..." oninput="document.getElementById('form-img-preview-tag').src = this.value || 'images/default-woodcraft.svg'">
        <div class="form-img-preview-box">
          <img id="form-img-preview-tag" src="${escapeHTML(defaultImg)}" class="form-img-preview" alt="preview" onerror="this.onerror=null; this.src='images/default-woodcraft.svg';" />
          <span style="font-size: 0.6875rem; color: var(--color-text-subtle);">Xem trước ảnh đại diện kiệt tác</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-prod-desc">Chi Tiết Sản Phẩm & Mô Tả Chế Tác:</label>
        <textarea id="field-prod-desc" class="form-control" placeholder="Mô tả chất gỗ, vân mây, mộng thắt, độ ẩm...">${escapeHTML(itemToEdit?.['Chi Tiết Sản Phẩm'] || itemToEdit?.Short_Desc || itemToEdit?.Full_Desc || '')}</textarea>
      </div>
    `;
  } else if (view === 'categories') {
    title.textContent = isEdit ? `Chỉnh Sửa Danh Mục: ${itemToEdit.Cat_ID}` : 'Thêm Danh Mục Mới';

    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="field-cat-id">Mã Danh Mục (Cat_ID): <span class="required">*</span></label>
        <input type="text" id="field-cat-id" class="form-control" value="${escapeHTML(itemToEdit?.Cat_ID || '')}" placeholder="Ví dụ: CAT_PHONG_KHACH" required ${isEdit ? 'readonly style="background:#eee;"' : ''}>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-cat-name">Tên Danh Mục: <span class="required">*</span></label>
        <input type="text" id="field-cat-name" class="form-control" value="${escapeHTML(itemToEdit?.['Tên Danh Mục'] || itemToEdit?.Cat_Name || '')}" placeholder="Ví dụ: Bàn Ghế Phòng Khách" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-cat-desc">Mô Tả Danh Mục:</label>
        <textarea id="field-cat-desc" class="form-control" placeholder="Mô tả không gian trưng bày...">${escapeHTML(itemToEdit?.['Mô Tả Danh Mục'] || itemToEdit?.Description || '')}</textarea>
      </div>
    `;
  } else if (view === 'settings') {
    title.textContent = isEdit ? `Chỉnh Sửa Cấu Hình: ${itemToEdit.Key}` : 'Thêm Cấu Hình Mới';

    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="field-setting-key">Khóa Cấu Hình (Key): <span class="required">*</span></label>
        <input type="text" id="field-setting-key" class="form-control" value="${escapeHTML(itemToEdit?.Key || '')}" placeholder="Ví dụ: phone, zalo, messenger, banner_url" required ${isEdit ? 'readonly style="background:#eee;"' : ''}>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-setting-value">Giá Trị Cấu Hình (Value): <span class="required">*</span></label>
        <input type="text" id="field-setting-value" class="form-control" value="${escapeHTML(itemToEdit?.Value || '')}" placeholder="Giá trị cài đặt" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="field-setting-desc">Mô Tả Cấu Hình:</label>
        <textarea id="field-setting-desc" class="form-control" placeholder="Ghi chú vị trí hiển thị...">${escapeHTML(itemToEdit?.['Mô Tả'] || '')}</textarea>
      </div>
    `;
  }

  modal.classList.add('open');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const isEdit = !!STATE.editItem;
  const view = STATE.activeView;
  const modal = document.getElementById('crud-modal');

  let sheetName = 'Products';
  let rowValues = [];
  let targetRowIndex = isEdit ? STATE.editItem._rowIndex : null;

  if (view === 'products') {
    sheetName = 'Products';
    let prodId = document.getElementById('field-prod-id').value.trim();
    if (!prodId) {
      prodId = `MG-PROD-${Date.now().toString().slice(-4)}`;
    }
    const catId = document.getElementById('field-prod-cat').value.trim();
    const name = document.getElementById('field-prod-name').value.trim();
    const price = document.getElementById('field-prod-price').value.trim();
    const image = document.getElementById('field-prod-image').value.trim() || 'images/default-woodcraft.svg';
    const desc = document.getElementById('field-prod-desc').value.trim();

    rowValues = [prodId, catId, name, price, image, desc];
  } else if (view === 'categories') {
    sheetName = 'Categories';
    const catId = document.getElementById('field-cat-id').value.trim();
    const catName = document.getElementById('field-cat-name').value.trim();
    const catDesc = document.getElementById('field-cat-desc').value.trim();

    rowValues = [catId, catName, catDesc];
  } else if (view === 'settings') {
    sheetName = 'Settings';
    const key = document.getElementById('field-setting-key').value.trim();
    const val = document.getElementById('field-setting-value').value.trim();
    const desc = document.getElementById('field-setting-desc').value.trim();

    rowValues = [key, val, desc];
  }

  showLoading(isEdit ? 'Đang cập nhật dòng Google Sheets...' : 'Đang thêm dòng mới vào Google Sheets...');
  
  try {
    if (isEdit) {
      // UPDATE: spreadsheets.values.update
      const endColLetter = String.fromCharCode(65 + rowValues.length - 1);
      const range = `${sheetName}!A${targetRowIndex}:${endColLetter}${targetRowIndex}`;

      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: STATE.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowValues] }
      });

      showToast(`Đã cập nhật thành công dòng ${targetRowIndex} trên sheet ${sheetName}!`, 'success');
    } else {
      // CREATE: spreadsheets.values.append
      const range = `${sheetName}!A:A`;

      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: STATE.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowValues] }
      });

      showToast(`Đã thêm mới thành công vào sheet ${sheetName}!`, 'success');
    }

    modal.classList.remove('open');
    await loadAllSheetsData();
  } catch (err) {
    hideLoading();
    handleSheetsError(err, isEdit ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
  }
}

// ============================================================================
// 6. DELETE OPERATION (DELETE DIMENSION BATCH UPDATE)
// ============================================================================

function confirmDelete(id) {
  const view = STATE.activeView;
  let item = null;

  if (view === 'products') {
    item = STATE.data.products.find(p => (p.Prod_ID === id || p.Product_ID === id));
  } else if (view === 'categories') {
    item = STATE.data.categories.find(c => c.Cat_ID === id);
  } else if (view === 'settings') {
    item = STATE.data.settings.find(s => s.Key === id);
  }

  if (!item) return;

  STATE.deleteTarget = {
    view: view,
    item: item,
    rowIndex: item._rowIndex
  };

  const modal = document.getElementById('confirm-modal');
  const msg = document.getElementById('confirm-delete-msg');
  if (msg) {
    msg.innerHTML = `Bạn có chắc chắn muốn xóa vĩnh viễn mục <strong>${escapeHTML(id)}</strong> (dòng ${item._rowIndex}) khỏi Google Sheets?`;
  }
  if (modal) modal.classList.add('open');
}

async function executeDeleteTarget() {
  if (!STATE.deleteTarget) return;

  const { view, rowIndex } = STATE.deleteTarget;
  const sheetName = view === 'products' ? 'Products' : view === 'categories' ? 'Categories' : 'Settings';
  const sheetId = STATE.sheetsMeta.get(sheetName);

  if (sheetId === undefined) {
    showToast(`Không tìm thấy sheetId cho ${sheetName}`, 'error');
    return;
  }

  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.remove('open');

  showLoading(`Đang xóa dòng ${rowIndex} khỏi Google Sheets...`);

  try {
    // DELETE: spreadsheets.batchUpdate with deleteDimension
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: STATE.spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1, // 0-indexed, inclusive
                endIndex: rowIndex        // exclusive
              }
            }
          }
        ]
      }
    });

    showToast(`Đã xóa thành công dòng ${rowIndex} khỏi Google Sheets!`, 'success');
    STATE.deleteTarget = null;
    await loadAllSheetsData();
  } catch (err) {
    hideLoading();
    handleSheetsError(err, 'Xóa thất bại');
  }
}

// ============================================================================
// 7. ERROR HANDLING & NOTIFICATIONS (CATCH 403 & FEEDBACK)
// ============================================================================

function handleSheetsError(err, contextTitle) {
  console.error(`Google Sheets API Error (${contextTitle}):`, err);

  let statusCode = err?.status || err?.result?.error?.code;
  let message = err?.result?.error?.message || err?.message || 'Có lỗi xảy ra khi gọi Google Sheets API.';

  // Detect 403 Forbidden / Permission Denied
  if (statusCode === 403 || message.includes('The caller does not have permission') || message.includes('PERMISSION_DENIED')) {
    showToast(
      'Lỗi 403: Tài khoản Google của bạn không có quyền Chỉnh sửa (Editor) trên file Google Sheets này. Vui lòng mở file trên Google Drive, nhấn nút Chia sẻ và cấp quyền Chỉnh sửa cho email của bạn.',
      'error',
      8000
    );
    return;
  }

  // Detect 404
  if (statusCode === 404 || message.includes('Requested entity was not found')) {
    showToast('Lỗi 404: Không tìm thấy Google Spreadsheet ID. Vui lòng kiểm tra lại ID trong phần thiết lập.', 'error', 6000);
    return;
  }

  showToast(`${contextTitle}: ${message}`, 'error', 6000);
}

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconName = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 20px; color: inherit;">${iconName}</span>
    <div style="flex: 1; line-height: 1.4;">${escapeHTML(message)}</div>
    <button type="button" class="toast-close" aria-label="Đóng">
      <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
    </button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, duration);
}

function showLoading(text = 'Đang đồng bộ Google Sheets...') {
  const overlay = document.getElementById('loading-overlay');
  const textEl = document.getElementById('loading-text');
  if (textEl) textEl.textContent = text;
  if (overlay) overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('active');
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global hook for inline onclick attributes
window.adminApp = {
  onEditItem: (id) => {
    const view = STATE.activeView;
    let item = null;
    if (view === 'products') {
      item = STATE.data.products.find(p => (p.Prod_ID === id || p.Product_ID === id));
    } else if (view === 'categories') {
      item = STATE.data.categories.find(c => c.Cat_ID === id);
    } else if (view === 'settings') {
      item = STATE.data.settings.find(s => s.Key === id);
    }
    if (item) openCrudModal(item);
  },
  onConfirmDelete: (id) => {
    confirmDelete(id);
  }
};
