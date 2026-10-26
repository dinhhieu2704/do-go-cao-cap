/**
 * MỘC GIA TINH HOA - Main Application Controller
 * Live Dynamic Google Sheets Integration Engine (Real-Time Auto Sync)
 */

const GOOGLE_SHEET_ID = '1fvhKI-B-HP02--JdDvRy9QevfgyPo6Ekko34X-8ToKA';

const CONFIG = {
  pageSize: 6,
  localFallbacks: {
    settings: './data/google_settings.csv',
    categories: './data/google_categories.csv',
    products: './data/google_products.csv'
  }
};

const STATE = {
  settings: {},
  categories: [],
  categoryMap: new Map(),
  products: [],
  filteredProducts: [],
  activeCategory: 'all',
  currentPage: 1,
  isLoading: true
};

// High-resolution curated luxury woodcraft photography library for fallback / placeholder
const LUXURY_IMAGE_MAP = {
  'MG-BANAN-889': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGEJaCnEHKAUHKbKZWTaTHdPpzNczhQF0K0c0nvLl7A7jCtfwXPTx2l3UJbfH50mf6pyAw67PBd19MkTsozch1pvsADdymmeSfgFlRMYMla2X5CK9aTE5CGBnE1ZfgMaMBh0PPjMo1kXjVjNQ32V45RPSiN8CwQKH-gYSOJ3UyBGV5pl8cBt36jgMF_f2GX7Q7DnpJNiCEoAHE2X9JLAepKhcuRdD3dE7bzfJfQ1PT1duv6Ts7Xa0xc-t0ibTeL6dlzhZl5iVsSb8',
  'MG-SALON-101': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGFGFR7jEi0uS38y-p5wFPdJ7fdb1gcADmMIK_uW1e1FmDKd7349rUQkEB2fuf5S6uHWZYZHzTaGmRxqK4PIOQE6eMpHqY3tLGAWUD_AkRYld-5mpBYh3Gq244BahmLIwRU_xT4qIzzYCJ-I8Y_LrWIvU7vxXTYwrinaEG16-D7DgIllRVpwheJ-lMDVtUcul5Td38s24t3ohFyr2LI7hVcHaUrwJ3_i4mGfB2buvYJlqoKJ_QQgEzrELY7Vqs63nVftJ9JrMcPVY',
  'MG-BANAN-502': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOKPrezz_z59mN29-zm2QE-73pI0Az-LnzhosNotLFBYOAPzIaGV6lc9pzccUCoJtfENbRNZth0FxhhAgecv-39ZYmbYKNIEdyZo6bXtQHmQQPEfRWh-7x7931-Qmpzrr5In6srYNbciAOXLnwTFj3e2M4CkQjpjoMU7VTxDMhqi8ucqDggq_9vA8vrNPJrJfRpt9RCfK736Dbf_avwvVQadOuy2hBQDATzNYi4I8OdKSZq4n7tbNGNEAURqqnEQkAaTuJZ30oiY',
  'MG-SAPTHO-703': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlgRdquQn17OnmRCZF1nc8NTJDW4J34Ymk-OH7fw1s-fV0UfFDch1ax5hW5O2cm-HGu7akJ9cLa_XfKXV-naQiS1EcnTr3dVGFB9KAJjF9X6deqgQc7_vAhRabInD2SC2XDtsjkQIu_Ba0S2ncqCPK2N83RXXfK7dbx4uG4C2VQ4p3VvdboasIU6EcScVa6a8w1VV77eDa41XdByowUHOraukjNO35XM-uIuEfEKlm5k_UfynW7Z-lpECkSiIyQsyYHc_KNVZcdCA',
  'MG-GIUONG-904': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOt9osXFOl4Uu85VBwlLe_KeJuocxh7hcEjZxRtvxyN9LRiPuns7ggePLfax_yScVYH7lT2JB4zFHc37hmZiugTj3V_gfp6afZVAM5BUeIGl7K4fak6hauDuhydgzlamK3p7XgxW7HIVLeteLRhjjjocLJpNbgLz_Hfi7_nslAR2BimNw9vevngTBeLDXF7GfKZL47bXDZlmPv7gi1XaB0BmJuenXxPXjG-48yK0nZjZakTxd6blVeepOH0_fthvhWeA_y8Tq1GLU',
  'MG-TUCHE-305': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj0J8ds7iUAAxdQvbraproeXPSKNrJFxFg_K8sLd6UqKXweHYuSF6-cwD7qkGeMfOIFs3eXyEHQ1lfJYu-Hcul55S90Ge7emRGmms_yAAyErh7WRf3oSWjPVLPDsILMvjVfHOYf30VCB7xW5Kt8T-bWGRKAO6kDQOCPcNlgnJnOIb1LNU6wpEPh1wFOrQmn4_TdVtf3krQa1LvckqcC87_8M5RfCPeFETyeQ4t-CPC-zpUVObsdc6GeiW_FILltsZUeRJ9XR7TmvY',
  'MG-TUONG-606': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj0J8ds7iUAAxdQvbraproeXPSKNrJFxFg_K8sLd6UqKXweHYuSF6-cwD7qkGeMfOIFs3eXyEHQ1lfJYu-Hcul55S90Ge7emRGmms_yAAyErh7WRf3oSWjPVLPDsILMvjVfHOYf30VCB7xW5Kt8T-bWGRKAO6kDQOCPcNlgnJnOIb1LNU6wpEPh1wFOrQmn4_TdVtf3krQa1LvckqcC87_8M5RfCPeFETyeQ4t-CPC-zpUVObsdc6GeiW_FILltsZUeRJ9XR7TmvY',
  'MG-TURUOU-407': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPZyFmPxohw-SUq8HoPWjHjv2OCN6vTv4zZgwPh8YQtwpM3j0NhtiRyOLNhDgl41P0NQCqpAjMMhLSg9XbWixXrrAEsMNQQEK7wuc-CeyQE642Te0HkpJYrayqYCgmoiTwacrpi7upfIJqr2yEtzS9-d5h6M4pg3yRqCVGOwp13hvd7OIhVOjRqGauevPU0JH1h0IxuIoG-ID3iL1gP0px_yYGWRy-iNCGQ2VTerU9Gg2LvoNXKZ2oBR254647Nnu4cizrF0V7dIc',
  'MG-DONGHO-808': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlgRdquQn17OnmRCZF1nc8NTJDW4J34Ymk-OH7fw1s-fV0UfFDch1ax5hW5O2cm-HGu7akJ9cLa_XfKXV-naQiS1EcnTr3dVGFB9KAJjF9X6deqgQc7_vAhRabInD2SC2XDtsjkQIu_Ba0S2ncqCPK2N83RXXfK7dbx4uG4C2VQ4p3VvdboasIU6EcScVa6a8w1VV77eDa41XdByowUHOraukjNO35XM-uIuEfEKlm5k_UfynW7Z-lpECkSiIyQsyYHc_KNVZcdCA',
  'PROD_01': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOKPrezz_z59mN29-zm2QE-73pI0Az-LnzhosNotLFBYOAPzIaGV6lc9pzccUCoJtfENbRNZth0FxhhAgecv-39ZYmbYKNIEdyZo6bXtQHmQQPEfRWh-7x7931-Qmpzrr5In6srYNbciAOXLnwTFj3e2M4CkQjpjoMU7VTxDMhqi8ucqDggq_9vA8vrNPJrJfRpt9RCfK736Dbf_avwvVQadOuy2hBQDATzNYi4I8OdKSZq4n7tbNGNEAURqqnEQkAaTuJZ30oiY',
  'PROD_02': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGFGFR7jEi0uS38y-p5wFPdJ7fdb1gcADmMIK_uW1e1FmDKd7349rUQkEB2fuf5S6uHWZYZHzTaGmRxqK4PIOQE6eMpHqY3tLGAWUD_AkRYld-5mpBYh3Gq244BahmLIwRU_xT4qIzzYCJ-I8Y_LrWIvU7vxXTYwrinaEG16-D7DgIllRVpwheJ-lMDVtUcul5Td38s24t3ohFyr2LI7hVcHaUrwJ3_i4mGfB2buvYJlqoKJ_QQgEzrELY7Vqs63nVftJ9JrMcPVY',
  'PROD_03': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOt9osXFOl4Uu85VBwlLe_KeJuocxh7hcEjZxRtvxyN9LRiPuns7ggePLfax_yScVYH7lT2JB4zFHc37hmZiugTj3V_gfp6afZVAM5BUeIGl7K4fak6hauDuhydgzlamK3p7XgxW7HIVLeteLRhjjjocLJpNbgLz_Hfi7_nslAR2BimNw9vevngTBeLDXF7GfKZL47bXDZlmPv7gi1XaB0BmJuenXxPXjG-48yK0nZjZakTxd6blVeepOH0_fthvhWeA_y8Tq1GLU',
  'PROD_04': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPZyFmPxohw-SUq8HoPWjHjv2OCN6vTv4zZgwPh8YQtwpM3j0NhtiRyOLNhDgl41P0NQCqpAjMMhLSg9XbWixXrrAEsMNQQEK7wuc-CeyQE642Te0HkpJYrayqYCgmoiTwacrpi7upfIJqr2yEtzS9-d5h6M4pg3yRqCVGOwp13hvd7OIhVOjRqGauevPU0JH1h0IxuIoG-ID3iL1gP0px_yYGWRy-iNCGQ2VTerU9Gg2LvoNXKZ2oBR254647Nnu4cizrF0V7dIc',
  'PROD_05': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGEJaCnEHKAUHKbKZWTaTHdPpzNczhQF0K0c0nvLl7A7jCtfwXPTx2l3UJbfH50mf6pyAw67PBd19MkTsozch1pvsADdymmeSfgFlRMYMla2X5CK9aTE5CGBnE1ZfgMaMBh0PPjMo1kXjVjNQ32V45RPSiN8CwQKH-gYSOJ3UyBGV5pl8cBt36jgMF_f2GX7Q7DnpJNiCEoAHE2X9JLAepKhcuRdD3dE7bzfJfQ1PT1duv6Ts7Xa0xc-t0ibTeL6dlzhZl5iVsSb8'
};

function resolveProductImage(url, id, name, catId) {
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if ((trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !trimmed.includes('[link removed]')) {
      return trimmed;
    }
  }

  if (id && LUXURY_IMAGE_MAP[id]) {
    return LUXURY_IMAGE_MAP[id];
  }

  const text = ((name || '') + ' ' + (catId || '')).toLowerCase();
  if (text.includes('bàn ăn') || text.includes('ban-an') || text.includes('bếp')) {
    return LUXURY_IMAGE_MAP['MG-BANAN-889'];
  }
  if (text.includes('salon') || text.includes('sofa') || text.includes('phòng khách') || text.includes('ghế')) {
    return LUXURY_IMAGE_MAP['MG-SALON-101'];
  }
  if (text.includes('thờ') || text.includes('sập')) {
    return LUXURY_IMAGE_MAP['MG-SAPTHO-703'];
  }
  if (text.includes('giường') || text.includes('ngủ')) {
    return LUXURY_IMAGE_MAP['MG-GIUONG-904'];
  }
  if (text.includes('tủ chè') || text.includes('cẩn ốc')) {
    return LUXURY_IMAGE_MAP['MG-TUCHE-305'];
  }
  if (text.includes('tượng') || text.includes('phật') || text.includes('di lặc') || text.includes('mỹ nghệ')) {
    return LUXURY_IMAGE_MAP['MG-TUONG-606'];
  }
  if (text.includes('rượu') || text.includes('tủ')) {
    return LUXURY_IMAGE_MAP['MG-TURUOU-407'];
  }
  if (text.includes('đồng hồ') || text.includes('quả lắc')) {
    return LUXURY_IMAGE_MAP['MG-DONGHO-808'];
  }

  return LUXURY_IMAGE_MAP['MG-BANAN-889'];
}

function getGoogleSheetUrl(sheetName) {
  // Always append timestamp to prevent browser & proxy caching
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
}

function parseCSV(text) {
  if (window.Papa && typeof window.Papa.parse === 'function') {
    return window.Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    }).data;
  }

  const lines = [];
  let row = [];
  let col = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        col += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(col.trim());
      col = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(col.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      col = '';
    } else {
      col += char;
    }
  }
  if (col || row.length > 0) {
    row.push(col.trim());
    lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
  return lines.slice(1).map(lineValues => {
    const item = {};
    headers.forEach((header, idx) => {
      item[header] = lineValues[idx] !== undefined ? lineValues[idx].replace(/^["']|["']$/g, '').trim() : '';
    });
    return item;
  });
}

async function fetchWithFallback(sheetName, fallbackUrl) {
  const primaryUrl = getGoogleSheetUrl(sheetName);
  try {
    const res = await fetch(primaryUrl, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) return text;
    }
    throw new Error('Primary status: ' + res.status);
  } catch (err) {
    console.warn(`Fetch trực tiếp thất bại (${sheetName}), sử dụng bản dự phòng cục bộ:`, err);
    const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
    return await fallbackRes.text();
  }
}

function resolveCatIcon(name, id, rawIcon) {
  const iconMap = {
    'chair': 'chair',
    'table_restaurant': 'table_restaurant',
    'bed': 'bed',
    'temple_buddhist': 'temple_buddhist',
    'auto_awesome': 'auto_awesome',
    'museum': 'museum',
    'self_improvement': 'museum', // Standardize user's self_improvement icon to museum
    'CAT_PHONG_KHACH': 'chair',
    'CAT_BAN_AN': 'table_restaurant',
    'CAT_PHONG_NGU': 'bed',
    'CAT_PHONG_THO': 'temple_buddhist',
    'CAT_MY_NGHE': 'museum'
  };

  if (rawIcon && iconMap[rawIcon]) return iconMap[rawIcon];
  if (id && iconMap[id]) return iconMap[id];

  const lower = ((name || '') + ' ' + (id || '')).toLowerCase();
  if (lower.includes('khách') || lower.includes('sofa')) return 'chair';
  if (lower.includes('ăn') || lower.includes('bếp')) return 'table_restaurant';
  if (lower.includes('ngủ') || lower.includes('giường')) return 'bed';
  if (lower.includes('thờ') || lower.includes('tâm linh')) return 'temple_buddhist';
  if (lower.includes('mỹ nghệ') || lower.includes('tượng') || lower.includes('nghệ thuật')) return 'museum';
  if (lower.includes('văn phòng') || lower.includes('giám đốc')) return 'desk';
  if (lower.includes('all') || lower.includes('tất cả')) return 'auto_awesome';
  return 'diamond';
}

async function loadMultiSheetDatabase() {
  const gridContainer = document.getElementById('product-grid');
  const errorBanner = document.getElementById('network-error-banner');

  if (gridContainer && STATE.products.length === 0) {
    renderSkeletons(gridContainer, 6);
  }

  try {
    const [settingsRaw, categoriesRaw, productsRaw] = await Promise.all([
      fetchWithFallback('Settings', CONFIG.localFallbacks.settings),
      fetchWithFallback('Categories', CONFIG.localFallbacks.categories),
      fetchWithFallback('Products', CONFIG.localFallbacks.products)
    ]);

    // 1. PARSE SETTINGS DYNAMICALLY
    const settingsRows = parseCSV(settingsRaw);
    STATE.settings = {};
    settingsRows.forEach(r => {
      if (r.Key) STATE.settings[r.Key] = r.Value;
    });

    // 2. PARSE CATEGORIES DYNAMICALLY
    const categoriesRows = parseCSV(categoriesRaw);
    STATE.categoryMap.clear();

    let hasAllCat = false;
    categoriesRows.forEach(r => {
      const catId = r.Cat_ID || r.cat_id || r.id;
      const catName = r.Cat_Name || r['Tên Danh Mục'] || r.name;
      if (catId && catName) {
        if (catId === 'all') hasAllCat = true;
        const icon = resolveCatIcon(catName, catId, r.Icon);
        const catObj = {
          Cat_ID: catId,
          Cat_Name: catName,
          Icon: icon,
          Description: r.Description || r['Mô Tả Danh Mục'] || '',
          Slug: r.Slug || ''
        };
        STATE.categoryMap.set(catId, catObj);
      }
    });

    // Ensure 'all' (Tất Cả Kiệt Tác) always exists
    if (!hasAllCat) {
      const allObj = {
        Cat_ID: 'all',
        Cat_Name: 'Tất Cả Kiệt Tác',
        Icon: 'auto_awesome',
        Description: 'Toàn bộ kiệt tác đồ gỗ mỹ nghệ cao cấp độc bản'
      };
      const mapEntries = Array.from(STATE.categoryMap.entries());
      STATE.categoryMap.clear();
      STATE.categoryMap.set('all', allObj);
      mapEntries.forEach(([k, v]) => STATE.categoryMap.set(k, v));
    }

    // 3. PARSE PRODUCTS DYNAMICALLY FROM GOOGLE SHEETS
    const productRows = parseCSV(productsRaw);
    const googleProducts = productRows.map((row, idx) => {
      const id = row.Product_ID || row.Prod_ID || row.id || (`PROD_${idx + 1}`);
      const catId = row.Cat_ID || row.cat_id || 'all';
      const name = row.Name || row['Tên Sản Phẩm'] || row.name || 'Kiệt Tác Gỗ';
      const price = row.Price_Display || row.Price || row['Giá VNĐ'] || 'Liên Hệ Báo Giá';
      const rawImage = row.Image_Main || row['Hình Ảnh URL'] || row.Image || '';
      const image = resolveProductImage(rawImage, id, name, catId);
      const desc = row.Short_Desc || row['Mô Tả Ngắn'] || row.Full_Desc || row['Chi Tiết Sản Phẩm'] || '';
      const fullDesc = row.Full_Desc || row['Chi Tiết Sản Phẩm'] || desc;
      const wood = row.Wood_Type || row['Chất Liệu'] || row['Loại Gỗ'] || 'Gỗ Tự Nhiên Tuyển Chọn';
      const dimensions = row.Dimensions || row['Kích Thước'] || 'Theo quy chuẩn dinh thự';
      const weight = row.Weight || row['Khối Lượng'] || row['Cân Nặng'] || 'Nguyên khối cao cấp';
      const badge = row.Badge || row['Huy Hiệu'] || (idx === 0 ? 'Độc Bản 1-0-2' : idx === 1 ? 'Kiệt Tác Nghệ Nhân' : 'Gỗ Quý Tuyển Chọn');

      // Auto-synthesize category if a newly added product introduces an unlisted Cat_ID
      if (catId && catId !== 'all' && !STATE.categoryMap.has(catId)) {
        const friendlyName = catId.replace(/^CAT_/, '').replace(/_/g, ' ')
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        STATE.categoryMap.set(catId, {
          Cat_ID: catId,
          Cat_Name: friendlyName,
          Icon: resolveCatIcon(friendlyName, catId, ''),
          Description: 'Danh mục kiệt tác độc bản'
        });
      }

      return {
        Product_ID: id,
        Cat_ID: catId,
        Name: name,
        Price_Display: price,
        Image_Main: image,
        Thumb1: resolveProductImage(row.Thumb1, id, name, catId),
        Thumb2: resolveProductImage(row.Thumb2, id, name, catId),
        Thumb3: resolveProductImage(row.Thumb3, id, name, catId),
        Short_Desc: desc,
        Full_Desc: fullDesc,
        Wood_Type: wood,
        Dimensions: dimensions,
        Weight: weight,
        Badge: badge,
        Finish: row.Finish || 'Sơn dầu hữu cơ satin',
        Status: row.Status || 'Có sẵn tại Showroom',
        Specs_Detail: row.Specs_Detail || '',
        Story_CITES: row.Story_CITES || '',
        categoryName: STATE.categoryMap.get(catId)?.Cat_Name || 'Kiệt Tác Gỗ'
      };
    });

    STATE.categories = Array.from(STATE.categoryMap.values());
    STATE.products = googleProducts;

    // Filter products for active category
    if (STATE.activeCategory === 'all') {
      STATE.filteredProducts = [...googleProducts];
    } else {
      STATE.filteredProducts = googleProducts.filter(p => p.Cat_ID === STATE.activeCategory);
      if (STATE.filteredProducts.length === 0 && STATE.activeCategory !== 'all') {
        STATE.activeCategory = 'all';
        STATE.filteredProducts = [...googleProducts];
      }
    }

    STATE.isLoading = false;

    // Render UI components
    applyDynamicSettings(STATE.settings);
    renderCategoryFilters(STATE.categories);
    renderCurrentPageProducts();
    renderPagination();
    initCategoryCarousel();

    if (errorBanner) errorBanner.classList.remove('show');
  } catch (error) {
    console.error('Lỗi tải dữ liệu Google Sheets trực tiếp:', error);
    STATE.isLoading = false;
    if (errorBanner) errorBanner.classList.add('show');
  }
}

function applyDynamicSettings(settings) {
  if (!settings) return;

  const phone = settings.phone || '0988888888';
  const phoneDisplay = settings.phone_display || phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
  const zaloUrl = settings.zalo_url && !settings.zalo_url.includes('[link removed]')
    ? settings.zalo_url
    : `https://zalo.me/${settings.zalo || phone}`;
  const messengerUrl = settings.messenger_url && !settings.messenger_url.includes('[link removed]')
    ? settings.messenger_url
    : `https://m.me/${settings.messenger || 'mocgiatinhhoa'}`;

  // Link attributes
  document.querySelectorAll('[data-setting-href="phone"]').forEach(el => el.setAttribute('href', `tel:${phone}`));
  document.querySelectorAll('[data-setting-href="zalo"]').forEach(el => el.setAttribute('href', zaloUrl));
  document.querySelectorAll('[data-setting-href="messenger"]').forEach(el => el.setAttribute('href', messengerUrl));

  // Dynamic text mapping for any setting key
  Object.keys(settings).forEach(key => {
    document.querySelectorAll(`[data-setting-text="${key}"]`).forEach(el => {
      el.textContent = settings[key];
    });
  });

  if (settings.phone_display) {
    document.querySelectorAll('[data-setting-text="phone_display"]').forEach(el => {
      el.textContent = settings.phone_display;
    });
  }
}

function renderCategoryFilters(categories) {
  const container = document.getElementById('category-filter-tabs');
  if (!container) return;

  const fragment = document.createDocumentFragment();

  function createBtn(cat) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `filter-btn ${cat.Cat_ID === STATE.activeCategory ? 'active' : ''}`;
    btn.setAttribute('data-cat-id', cat.Cat_ID);

    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined';
    iconSpan.textContent = cat.Icon || 'label';

    const textSpan = document.createElement('span');
    textSpan.textContent = cat.Cat_Name;

    btn.appendChild(iconSpan);
    btn.appendChild(textSpan);

    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => {
        if (b.getAttribute('data-cat-id') === cat.Cat_ID) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      filterProductsByCategory(cat.Cat_ID);
    });

    return btn;
  }

  // Set 1
  categories.forEach(cat => {
    fragment.appendChild(createBtn(cat));
  });

  // Set 2: Duplicate for seamless infinite marquee scroll
  if (categories.length >= 2) {
    categories.forEach(cat => {
      fragment.appendChild(createBtn(cat));
    });
  }

  container.innerHTML = '';
  container.appendChild(fragment);
}

function filterProductsByCategory(catId) {
  STATE.activeCategory = catId;
  STATE.currentPage = 1; // Reset to page 1 on filter change

  if (catId === 'all') {
    STATE.filteredProducts = [...STATE.products];
  } else {
    STATE.filteredProducts = STATE.products.filter(p => p.Cat_ID === catId);
  }

  renderCurrentPageProducts();
  renderPagination();
}

function renderCurrentPageProducts() {
  const container = document.getElementById('product-grid');
  if (!container) return;

  const total = STATE.filteredProducts.length;
  if (total === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; width: 100%; grid-column: 1 / -1;">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-secondary);">inventory_2</span>
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-top: 1rem; color: var(--color-primary);">Không tìm thấy kiệt tác trong danh mục này</h3>
        <p style="color: var(--color-text-muted); margin-top: 0.5rem;">Vui lòng chọn danh mục khác hoặc liên hệ Hotline để đặt tác phẩm độc bản riêng.</p>
      </div>
    `;
    return;
  }

  // Maximum 6 products per page (2 rows x 3 columns)
  const startIdx = (STATE.currentPage - 1) * CONFIG.pageSize;
  const pageProducts = STATE.filteredProducts.slice(startIdx, startIdx + CONFIG.pageSize);

  const fragment = document.createDocumentFragment();

  // Exactly 1 card per product on the current page (clean 3-column grid)
  pageProducts.forEach(item => {
    fragment.appendChild(createProductCard(item));
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  // Bind Quickview buttons
  container.querySelectorAll('[data-quickview-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-quickview-id');
      openQuickViewModal(pId);
    });
  });

  // Ensure any cached or completed images update their visual state immediately
  initImageSafety(container);
}

function initImageSafety(container = document) {
  const defaultImg = 'images/default-woodcraft.svg';
  container.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      if (img.naturalWidth > 0) {
        img.classList.add('is-loaded');
        img.closest('.is-loading')?.classList.remove('is-loading');
      } else if (img.src) {
        img.onerror = null;
        img.src = defaultImg;
        img.classList.add('is-loaded', 'is-fallback');
        img.closest('.is-loading')?.classList.remove('is-loading');
      }
    }
  });
}

function createProductCard(item) {
  const card = document.createElement('article');
  card.className = 'product-card card-tilt-hover';
  card.setAttribute('data-id', item.Product_ID);

  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.Product_ID)}`;

  card.innerHTML = `
    <div class="product-card-media zoom-trigger is-loading">
      <div class="product-badge-group">
        ${item.Badge ? `<span class="badge-tag">${escapeHTML(item.Badge)}</span>` : ''}
        <span class="badge-tag badge-secondary">${escapeHTML(item.Wood_Type || 'Gỗ Quý')}</span>
      </div>
      <img class="product-card-img zoom-target"
           src="${escapeHTML(item.Image_Main)}"
           alt="${escapeHTML(item.Name)}"
           loading="lazy"
           draggable="false"
           onload="this.classList.add('is-loaded'); this.closest('.is-loading')?.classList.remove('is-loading');"
           onerror="this.onerror=null; this.src='images/default-woodcraft.svg'; this.classList.add('is-loaded', 'is-fallback'); this.closest('.is-loading')?.classList.remove('is-loading');" />
      <div class="card-quick-overlay">
        <button type="button" class="btn-card-quickview" data-quickview-id="${escapeHTML(item.Product_ID)}">
          <span class="material-symbols-outlined" style="font-size: 16px;">visibility</span>
          <span>Xem Nhanh</span>
        </button>
      </div>
    </div>
    <div class="product-card-body">
      <span class="product-card-category">${escapeHTML(item.categoryName)}</span>
      <h3 class="product-card-title">
        <a href="${detailUrl}">${escapeHTML(item.Name)}</a>
      </h3>
      <div class="product-card-specs">
        <div class="spec-item spec-dim" title="Kích thước / Chiều cao: ${escapeHTML(item.Dimensions || 'Theo quy chuẩn')}">
          <span class="material-symbols-outlined">straighten</span>
          <span class="spec-text">${escapeHTML(item.Dimensions || 'Cao: Theo chuẩn')}</span>
        </div>
        <div class="spec-item spec-weight" title="Cân nặng / Khối lượng: ${escapeHTML(item.Weight || 'Nguyên khối')}">
          <span class="material-symbols-outlined">scale</span>
          <span class="spec-text">${escapeHTML(item.Weight || 'Nguyên khối')}</span>
        </div>
      </div>
      <p class="product-card-desc">${escapeHTML(item.Short_Desc || '')}</p>
      <div class="product-card-footer">
        <div>
          <span class="product-price-label">Mức Giá Di Sản</span>
          <span class="product-price-value">${escapeHTML(item.Price_Display || 'Liên Hệ Báo Giá')}</span>
        </div>
        <a href="${detailUrl}" class="btn-card-detail">
          <span>Chi Tiết</span>
          <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
        </a>
      </div>
    </div>
  `;

  attachCard3DTilt(card);
  return card;
}

function renderPagination() {
  const container = document.getElementById('pagination-container');
  const infoEl = document.getElementById('pagination-info');
  const controlsEl = document.getElementById('pagination-controls');
  if (!container || !controlsEl) return;

  const totalItems = STATE.filteredProducts.length;
  const totalPages = Math.ceil(totalItems / CONFIG.pageSize) || 1;

  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  const startIdx = (STATE.currentPage - 1) * CONFIG.pageSize;
  const endIdx = Math.min(startIdx + CONFIG.pageSize, totalItems);

  if (infoEl) {
    infoEl.innerHTML = `Hiển thị <strong>${startIdx + 1} - ${endIdx}</strong> trên tổng số <strong>${totalItems}</strong> kiệt tác (Tối đa ${CONFIG.pageSize} sản phẩm/trang - 3 sản phẩm/hàng)`;
  }

  const fragment = document.createDocumentFragment();

  // Previous Page Button
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'pagination-btn nav-step';
  prevBtn.disabled = STATE.currentPage === 1;
  prevBtn.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 18px;">chevron_left</span>
    <span>Trước</span>
  `;
  prevBtn.addEventListener('click', () => {
    if (STATE.currentPage > 1) {
      goToPage(STATE.currentPage - 1);
    }
  });
  fragment.appendChild(prevBtn);

  // Number Buttons
  for (let p = 1; p <= totalPages; p++) {
    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.className = `pagination-btn ${p === STATE.currentPage ? 'active' : ''}`;
    pageBtn.textContent = p;
    pageBtn.setAttribute('aria-label', `Chuyển tới trang ${p}`);

    pageBtn.addEventListener('click', () => {
      goToPage(p);
    });
    fragment.appendChild(pageBtn);
  }

  // Next Page Button
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'pagination-btn nav-step';
  nextBtn.disabled = STATE.currentPage === totalPages;
  nextBtn.innerHTML = `
    <span>Sau</span>
    <span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>
  `;
  nextBtn.addEventListener('click', () => {
    if (STATE.currentPage < totalPages) {
      goToPage(STATE.currentPage + 1);
    }
  });
  fragment.appendChild(nextBtn);

  controlsEl.innerHTML = '';
  controlsEl.appendChild(fragment);
}

function goToPage(pageNumber) {
  STATE.currentPage = pageNumber;
  renderCurrentPageProducts();
  renderPagination();

  const showcaseEl = document.getElementById('showcase');
  if (showcaseEl) {
    showcaseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

let categoryCarouselInitialized = false;
let categoryAnimId = null;

function initCategoryCarousel() {
  const carousel = document.getElementById('category-carousel');
  const prevBtn = document.getElementById('category-prev-btn');
  const nextBtn = document.getElementById('category-next-btn');

  if (!carousel) return;

  let isHovered = false;
  let isPointerDown = false;
  let startX = 0;
  let scrollStart = 0;
  let hasDragged = false;
  const speed = 0.65;

  function autoScrollLoop() {
    if (!isHovered && !isPointerDown) {
      carousel.scrollLeft += speed;
      const half = carousel.scrollWidth / 2;
      if (half > 0 && carousel.scrollLeft >= half) {
        carousel.scrollLeft -= half;
      }
    }
    categoryAnimId = requestAnimationFrame(autoScrollLoop);
  }

  if (categoryAnimId) cancelAnimationFrame(categoryAnimId);
  categoryAnimId = requestAnimationFrame(autoScrollLoop);

  if (categoryCarouselInitialized) return;
  categoryCarouselInitialized = true;

  // Hover detection: pause auto-scroll
  carousel.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    if (!isPointerDown) {
      carousel.classList.remove('is-dragging');
    }
  });

  // Mouse Drag to scroll: hold and drag horizontally
  carousel.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    startX = e.pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
    carousel.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', e => {
    if (!isPointerDown) return;
    const currentX = e.pageX - carousel.offsetLeft;
    const distance = currentX - startX;

    if (Math.abs(distance) > 5) {
      hasDragged = true;
    }

    carousel.scrollLeft = scrollStart - distance;

    const half = carousel.scrollWidth / 2;
    if (half > 0) {
      if (carousel.scrollLeft >= half) {
        carousel.scrollLeft -= half;
        scrollStart -= half;
      } else if (carousel.scrollLeft <= 0) {
        carousel.scrollLeft += half;
        scrollStart += half;
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (isPointerDown) {
      isPointerDown = false;
      carousel.classList.remove('is-dragging');
      setTimeout(() => {
        hasDragged = false;
      }, 50);
    }
  });

  // Prevent click navigation on drag
  carousel.addEventListener('click', e => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Touch Drag for Mobile / Tablet
  carousel.addEventListener('touchstart', e => {
    isHovered = true;
    isPointerDown = true;
    hasDragged = false;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
  }, { passive: true });

  carousel.addEventListener('touchmove', e => {
    if (!isPointerDown) return;
    const currentX = e.touches[0].pageX - carousel.offsetLeft;
    const distance = currentX - startX;
    if (Math.abs(distance) > 5) {
      hasDragged = true;
    }
    carousel.scrollLeft = scrollStart - distance;

    const half = carousel.scrollWidth / 2;
    if (half > 0) {
      if (carousel.scrollLeft >= half) {
        carousel.scrollLeft -= half;
        scrollStart -= half;
      } else if (carousel.scrollLeft <= 0) {
        carousel.scrollLeft += half;
        scrollStart += half;
      }
    }
  }, { passive: true });

  carousel.addEventListener('touchend', () => {
    isHovered = false;
    isPointerDown = false;
    setTimeout(() => {
      hasDragged = false;
    }, 50);
  }, { passive: true });

  // Navigation Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -250, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: 250, behavior: 'smooth' });
    });
  }
}

function renderSkeletons(container, count = 6) {
  if (!container) return;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const skCard = document.createElement('div');
    skCard.className = 'skeleton-card';
    skCard.innerHTML = `
      <div class="skeleton-shimmer"></div>
      <div class="skeleton-box skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-box skeleton-line short"></div>
        <div class="skeleton-box skeleton-line" style="height: 22px;"></div>
        <div class="skeleton-box skeleton-line mid"></div>
        <div class="skeleton-box skeleton-line" style="margin-top: auto; height: 32px;"></div>
      </div>
    `;
    fragment.appendChild(skCard);
  }

  container.innerHTML = '';
  container.appendChild(fragment);
}

function attachCard3DTilt(card) {
  let isHovered = false;

  card.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  card.addEventListener('mousemove', e => {
    if (!isHovered) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    const rotateX = -deltaY * 6;
    const rotateY = deltaX * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    isHovered = false;
    card.style.transform = '';
  });
}

function initParallax() {
  const heroParallax = document.getElementById('hero-parallax-bg');
  if (!heroParallax) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        if (scrolled < 1200) {
          heroParallax.style.transform = `translate3d(0, ${scrolled * 0.28}px, 0) scale(1.05)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('drawer-close-btn');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', e => {
    if (e.target === drawer) closeDrawer();
  });

  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

function openQuickViewModal(productId) {
  const item = STATE.products.find(p => p.Product_ID === productId);
  if (!item) return;

  const modalOverlay = document.getElementById('quickview-modal');
  const modalContent = document.getElementById('quickview-modal-content');
  if (!modalOverlay || !modalContent) return;

  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.Product_ID)}`;
  const phone = STATE.settings.phone || '0988888888';
  const zaloUrl = STATE.settings.zalo_url && !STATE.settings.zalo_url.includes('[link removed]')
    ? STATE.settings.zalo_url
    : `https://zalo.me/${STATE.settings.zalo || phone}`;
  const messengerUrl = STATE.settings.messenger_url && !STATE.settings.messenger_url.includes('[link removed]')
    ? STATE.settings.messenger_url
    : `https://m.me/${STATE.settings.messenger || 'mocgiatinhhoa'}`;

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
      <div class="quickview-media is-loading" style="aspect-ratio: 4/3; overflow: hidden; background: #24140d; border: 1px solid var(--color-border); position: relative;">
        <img src="${escapeHTML(item.Image_Main)}"
             alt="${escapeHTML(item.Name)}"
             style="width: 100%; height: 100%; object-fit: cover;"
             onload="this.classList.add('is-loaded'); this.closest('.is-loading')?.classList.remove('is-loading');"
             onerror="this.onerror=null; this.src='images/default-woodcraft.svg'; this.classList.add('is-loaded', 'is-fallback'); this.closest('.is-loading')?.classList.remove('is-loading');" />
      </div>
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span style="font-size: 0.6875rem; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.15em; text-transform: uppercase;">
            ${escapeHTML(item.categoryName)}
          </span>
          <h2 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-primary); margin: 0.5rem 0 1rem 0;">
            ${escapeHTML(item.Name)}
          </h2>
          <div style="font-family: var(--font-serif); font-size: 1.375rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 1rem;">
            ${escapeHTML(item.Price_Display || 'Liên Hệ')}
          </div>
          <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1rem;">
            ${escapeHTML(item.Short_Desc || item.Full_Desc || '')}
          </p>
          <div style="font-size: 0.8125rem; color: var(--color-text); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
            <div><strong>Chất liệu:</strong> ${escapeHTML(item.Wood_Type || 'Gỗ tự nhiên')}</div>
            <div style="display: flex; justify-content: space-between; width: 100%;">
              <span><strong>Kích thước:</strong> ${escapeHTML(item.Dimensions || 'Theo quy chuẩn')}</span>
              <span><strong>Khối lượng:</strong> ${escapeHTML(item.Weight || 'Nguyên khối')}</span>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <a href="${detailUrl}" class="btn-hero-primary" style="text-align: center; justify-content: center; padding: 0.875rem 1.5rem;">
            Xem Chi Tiết Tác Phẩm
          </a>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <a href="tel:${phone}" class="cta-btn-phone" style="padding: 0.625rem 0.875rem; justify-content: center; font-size: 0.75rem;">
              <span>Gọi: ${escapeHTML(STATE.settings.phone_display || phone)}</span>
            </a>
            <a href="${zaloUrl}" target="_blank" rel="noopener noreferrer" class="cta-btn-zalo" style="padding: 0.625rem 0.875rem; justify-content: center; font-size: 0.75rem;">
              <span>Chát Zalo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initQuickViewModal() {
  const modalOverlay = document.getElementById('quickview-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modalOverlay) return;

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
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

document.addEventListener('DOMContentLoaded', () => {
  // Always load realtime directly from Google Sheet on page load
  loadMultiSheetDatabase();
  initParallax();
  initMobileMenu();
  initQuickViewModal();

  // Retry fetch button (in error alert)
  const retryBtn = document.getElementById('retry-fetch-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      loadMultiSheetDatabase();
    });
  }
});
