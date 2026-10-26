/**
 * MỘC GIA TINH HOA - Product Detail Page Controller
 * Live Dynamic Google Sheets Integration Engine (Real-Time Detail View)
 */

const GOOGLE_SHEET_ID = '1fvhKI-B-HP02--JdDvRy9QevfgyPo6Ekko34X-8ToKA';

const CONFIG = {
  localFallbacks: {
    settings: './data/google_settings.csv',
    categories: './data/google_categories.csv',
    products: './data/google_products.csv'
  }
};

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
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
}

const DETAIL_STATE = {
  settings: {},
  categoryMap: new Map(),
  product: null,
  allProducts: []
};

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
    console.warn(`Fetch trực tiếp thất bại (${sheetName}), sử dụng bản dự phòng:`, err);
    const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
    return await fallbackRes.text();
  }
}

async function loadDetailPageData() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('id') || '';

  try {
    const [settingsRaw, categoriesRaw, productsRaw] = await Promise.all([
      fetchWithFallback('Settings', CONFIG.localFallbacks.settings),
      fetchWithFallback('Categories', CONFIG.localFallbacks.categories),
      fetchWithFallback('Products', CONFIG.localFallbacks.products)
    ]);

    const settingsData = parseCSV(settingsRaw);
    DETAIL_STATE.settings = {};
    settingsData.forEach(row => {
      const rawK = row.Key || row.key || row.KEY || row['Khóa'] || row['Tham Số'];
      const rawV = row.Value !== undefined ? row.Value : (row.value !== undefined ? row.value : (row['Giá Trị'] || row['Giá trị']));
      if (rawK && typeof rawK === 'string') {
        const cleanK = rawK.trim();
        const cleanV = typeof rawV === 'string' ? rawV.trim() : (rawV || '');
        DETAIL_STATE.settings[cleanK] = cleanV;
        DETAIL_STATE.settings[cleanK.toLowerCase()] = cleanV;
      }
    });

    const categoriesData = parseCSV(categoriesRaw);
    DETAIL_STATE.categoryMap.clear();
    categoriesData.forEach(cat => {
      const catId = cat.Cat_ID || cat.cat_id || cat.id;
      const catName = cat.Cat_Name || cat['Tên Danh Mục'] || cat.name;
      if (catId && catName) {
        DETAIL_STATE.categoryMap.set(catId, { Cat_ID: catId, Cat_Name: catName });
      }
    });

    const productsData = parseCSV(productsRaw);
    const normalizedProducts = productsData.map((row, idx) => {
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

      if (catId && !DETAIL_STATE.categoryMap.has(catId)) {
        const friendlyName = catId.replace(/^CAT_/, '').replace(/_/g, ' ')
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        DETAIL_STATE.categoryMap.set(catId, { Cat_ID: catId, Cat_Name: friendlyName });
      }

      return {
        Product_ID: id,
        Cat_ID: catId,
        Name: name,
        Slug: row.Slug || '',
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
        Finish: row.Finish || 'Dầu lau hữu cơ & sáp ong',
        Status: row.Status || 'Có sẵn tại Showroom',
        Specs_Detail: row.Specs_Detail || '',
        Story_CITES: row.Story_CITES || '',
        categoryName: DETAIL_STATE.categoryMap.get(catId)?.Cat_Name || 'Kiệt Tác Gỗ'
      };
    });

    DETAIL_STATE.allProducts = normalizedProducts;

    let matchedProduct = null;
    if (targetId) {
      matchedProduct = normalizedProducts.find(p => p.Product_ID === targetId || p.Slug === targetId);
    }
    if (!matchedProduct && normalizedProducts.length > 0) {
      matchedProduct = normalizedProducts[0];
    }

    if (!matchedProduct) {
      throw new Error('Sản phẩm không tồn tại trong hệ thống.');
    }

    DETAIL_STATE.product = matchedProduct;

    applyDynamicSettings(DETAIL_STATE.settings);
    renderProductDetail(matchedProduct);
    renderRelatedProducts(normalizedProducts, matchedProduct);
  } catch (err) {
    console.error('Lỗi nạp trang chi tiết:', err);
    const container = document.getElementById('product-detail-view');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem;">
          <h2 style="font-family: var(--font-serif); color: var(--color-primary); font-size: 2rem;">Tác phẩm đang được cập nhật</h2>
          <p style="color: var(--color-text-muted); margin: 1rem 0 2rem 0;">Vui lòng quay lại danh mục sản phẩm hoặc liên hệ hotline để nhận hồ sơ tác phẩm.</p>
          <a href="index.html" class="btn-hero-primary" style="display: inline-flex;">Về Trang Chủ Kiệt Tác</a>
        </div>
      `;
    }
  }
}

function applyDynamicSettings(settings) {
  if (!settings) return;

  const getVal = (...keys) => {
    for (const k of keys) {
      if (settings[k] !== undefined && settings[k] !== null && String(settings[k]).trim() !== '') {
        return String(settings[k]).trim();
      }
      const lower = k.toLowerCase();
      if (settings[lower] !== undefined && settings[lower] !== null && String(settings[lower]).trim() !== '') {
        return String(settings[lower]).trim();
      }
    }
    return '';
  };

  const phone = getVal('phone') || '0988888888';
  const phoneDisplay = getVal('phone_display') || phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');

  const rawZalo = getVal('zalo_url', 'zalo');
  let zaloUrl = '';
  if (rawZalo && !rawZalo.includes('[link removed]')) {
    zaloUrl = (rawZalo.startsWith('http://') || rawZalo.startsWith('https://')) ? rawZalo : `https://zalo.me/${rawZalo}`;
  } else {
    zaloUrl = `https://zalo.me/${getVal('zalo') || phone}`;
  }

  const rawMessenger = getVal('messenger_url', 'messenger');
  let messengerUrl = '';
  if (rawMessenger && !rawMessenger.includes('[link removed]')) {
    messengerUrl = (rawMessenger.startsWith('http://') || rawMessenger.startsWith('https://')) ? rawMessenger : `https://m.me/${rawMessenger}`;
  } else {
    messengerUrl = `https://m.me/${getVal('messenger') || 'mocgiatinhhoa'}`;
  }

  const email = getVal('email') || 'concierge@mocgiatinhhoa.vn';
  const brandName = getVal('brand_name') || 'MỘC GIA TINH HOA';
  const brandTagline = getVal('brand_tagline') || 'Nội Thất Gỗ Mỹ Nghệ Cao Cấp Độc Bản';
  const workingHours = getVal('working_hours') || '08:00 - 21:00 (Tất cả các ngày trong tuần)';
  const citesLicense = getVal('cites_license') || 'CITES-VN-2025';

  // 1. Link attributes
  document.querySelectorAll('[data-setting-href="phone"]').forEach(el => el.setAttribute('href', `tel:${phone}`));
  document.querySelectorAll('[data-setting-href="zalo"]').forEach(el => el.setAttribute('href', zaloUrl));
  document.querySelectorAll('[data-setting-href="messenger"]').forEach(el => el.setAttribute('href', messengerUrl));
  document.querySelectorAll('[data-setting-href="email"]').forEach(el => el.setAttribute('href', `mailto:${email}`));

  // 2. Direct core mappings
  const coreMappings = {
    phone,
    phone_display: phoneDisplay,
    email,
    brand_name: brandName,
    brand_tagline: brandTagline,
    working_hours: workingHours,
    cites_license: citesLicense
  };

  Object.entries(coreMappings).forEach(([k, v]) => {
    if (v) {
      document.querySelectorAll(`[data-setting-text="${k}"]`).forEach(el => {
        el.textContent = v;
      });
    }
  });

  // 3. Dynamic generic text mapping for any other custom key
  Object.keys(settings).forEach(key => {
    const val = settings[key];
    if (val && typeof val === 'string') {
      document.querySelectorAll(`[data-setting-text="${key}"]`).forEach(el => {
        el.textContent = val;
      });
    }
  });
}

function renderProductDetail(product) {
  document.title = `${product.Name} — ${DETAIL_STATE.settings.brand_name || 'MỘC GIA TINH HOA'}`;

  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbProduct = document.getElementById('breadcrumb-product');
  if (breadcrumbCategory) breadcrumbCategory.textContent = product.categoryName;
  if (breadcrumbProduct) breadcrumbProduct.textContent = product.Name;

  const titleEl = document.getElementById('product-title');
  const skuEl = document.getElementById('product-sku');
  const badgeEl = document.getElementById('product-badge');
  const woodTagEl = document.getElementById('product-wood-tag');
  const priceValEl = document.getElementById('product-price-val');

  if (titleEl) titleEl.textContent = product.Name;
  if (skuEl) skuEl.textContent = product.Product_ID;
  if (badgeEl) badgeEl.textContent = product.Badge || 'Kiệt Tác Gỗ Quý';
  if (woodTagEl) woodTagEl.textContent = product.Wood_Type || 'Gỗ Tự Nhiên Tuyển Chọn';
  if (priceValEl) priceValEl.textContent = product.Price_Display || 'Liên Hệ Trực Tiếp';

  const specDim = document.getElementById('spec-dimensions');
  const specWeight = document.getElementById('spec-weight');
  const specFinish = document.getElementById('spec-finish');

  if (specDim) specDim.textContent = product.Dimensions || 'Theo quy chuẩn';
  if (specWeight) specWeight.textContent = product.Weight || 'Nguyên khối cao cấp';
  if (specFinish) specFinish.textContent = product.Finish || 'Dầu lau hữu cơ & sáp ong';

  setupGallery(product);
  setupTabsContent(product);
}

function setupGallery(product) {
  const mainImg = document.getElementById('main-gallery-img');
  const thumbStrip = document.getElementById('thumbnail-strip');
  const mainFrame = document.getElementById('primary-image-frame');
  if (!mainImg || !thumbStrip) return;

  const defaultImg = 'images/default-woodcraft.svg';

  const images = [
    { url: product.Image_Main, label: 'Toàn Cảnh' },
    { url: product.Thumb1 || product.Image_Main, label: 'Vân Gỗ 3D' },
    { url: product.Thumb2 || product.Image_Main, label: 'Mộng Cổ Truyền' },
    { url: product.Thumb3 || product.Image_Main, label: 'Chi Tiết Hoàn Thiện' }
  ];

  if (mainFrame) mainFrame.classList.add('is-loading');
  mainImg.classList.remove('is-loaded');

  mainImg.onload = () => {
    mainImg.classList.add('is-loaded');
    if (mainFrame) mainFrame.classList.remove('is-loading');
  };
  mainImg.onerror = () => {
    mainImg.onerror = null;
    mainImg.src = defaultImg;
    mainImg.classList.add('is-loaded', 'is-fallback');
    if (mainFrame) mainFrame.classList.remove('is-loading');
  };

  mainImg.src = images[0].url;
  mainImg.alt = product.Name;

  if (mainImg.complete && mainImg.naturalWidth > 0) {
    mainImg.classList.add('is-loaded');
    if (mainFrame) mainFrame.classList.remove('is-loading');
  }

  const fragment = document.createDocumentFragment();

  images.forEach((imgObj, idx) => {
    const thumbBtn = document.createElement('button');
    thumbBtn.type = 'button';
    thumbBtn.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
    thumbBtn.setAttribute('data-index', idx);

    thumbBtn.innerHTML = `
      <div class="thumb-img-wrap is-loading">
        <img src="${escapeHTML(imgObj.url)}"
             alt="${escapeHTML(imgObj.label)}"
             loading="lazy"
             onload="this.classList.add('is-loaded'); this.closest('.is-loading')?.classList.remove('is-loading');"
             onerror="this.onerror=null; this.src='${defaultImg}'; this.classList.add('is-loaded', 'is-fallback'); this.closest('.is-loading')?.classList.remove('is-loading');" />
      </div>
      <p class="thumb-label">${escapeHTML(imgObj.label)}</p>
    `;

    thumbBtn.addEventListener('click', () => {
      thumbStrip.querySelectorAll('.thumb-item').forEach(b => b.classList.remove('active'));
      thumbBtn.classList.add('active');

      if (mainFrame) mainFrame.classList.add('is-loading');
      mainImg.classList.remove('is-loaded');

      setTimeout(() => {
        mainImg.src = imgObj.url;
      }, 50);
    });

    fragment.appendChild(thumbBtn);
  });

  thumbStrip.innerHTML = '';
  thumbStrip.appendChild(fragment);

  // Smooth Zoom on Main Gallery Hover
  if (mainFrame) {
    mainFrame.addEventListener('mousemove', e => {
      const rect = mainFrame.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImg.style.transformOrigin = `${x}% ${y}%`;
      mainImg.style.transform = 'scale(1.75)';
    });

    mainFrame.addEventListener('mouseleave', () => {
      mainImg.style.transformOrigin = 'center center';
      mainImg.style.transform = 'scale(1)';
    });
  }
}

function setupTabsContent(product) {
  const storyBody = document.getElementById('tab-story-text');
  const storyCites = document.getElementById('tab-story-cites');
  if (storyBody) {
    storyBody.textContent = product.Full_Desc || product.Short_Desc || 'Tuyệt tác đồ gỗ quý hiếm gia truyền.';
  }
  if (storyCites) {
    storyCites.textContent = product.Story_CITES || 'Khai thác hợp pháp theo chứng nhận CITES quốc tế, phơi sấy tiêu chuẩn châu Âu giữ trọn vẹn thớ gỗ tự nhiên.';
  }

  const specsTableBody = document.getElementById('specs-table-body');
  if (specsTableBody) {
    specsTableBody.innerHTML = `
      <tr>
        <td>Tên tác phẩm</td>
        <td><strong>${escapeHTML(product.Name)}</strong></td>
      </tr>
      <tr>
        <td>Mã số định danh (SKU)</td>
        <td><span class="sku-tag">${escapeHTML(product.Product_ID)}</span></td>
      </tr>
      <tr>
        <td>Dòng danh mục</td>
        <td>${escapeHTML(product.categoryName)}</td>
      </tr>
      <tr>
        <td>Chất liệu gỗ</td>
        <td>${escapeHTML(product.Wood_Type || 'Gỗ tự nhiên nguyên khối')}</td>
      </tr>
      <tr>
        <td>Kích thước chuẩn</td>
        <td>${escapeHTML(product.Dimensions || 'Theo quy chuẩn nghệ nhân')}</td>
      </tr>
      <tr>
        <td>Khối lượng tịnh</td>
        <td>${escapeHTML(product.Weight || 'Nguyên khối')}</td>
      </tr>
      <tr>
        <td>Kỹ thuật ghép mộng</td>
        <td>100% mộng âm dương thắt ngàm, triệt tiêu đinh ốc kim loại</td>
      </tr>
      <tr>
        <td>Lớp phủ bảo vệ bề mặt</td>
        <td>${escapeHTML(product.Finish || 'Dầu lau hữu cơ & sáp ong nguyên chất')}</td>
      </tr>
      <tr>
        <td>Chứng nhận nguồn gốc</td>
        <td>${escapeHTML(product.Story_CITES || 'Hợp pháp CITES quốc tế & Cam kết bảo tồn vân gỗ tự nhiên')}</td>
      </tr>
      ${product.Specs_Detail ? `
      <tr>
        <td>Quy cách chi tiết</td>
        <td>${escapeHTML(product.Specs_Detail)}</td>
      </tr>` : ''}
    `;
  }

  const tabButtons = document.querySelectorAll('.tab-nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function renderRelatedProducts(allProducts, currentProduct) {
  const container = document.getElementById('related-products-grid');
  if (!container) return;

  let related = allProducts.filter(p => p.Product_ID !== currentProduct.Product_ID);
  // Prioritize same category
  const sameCategory = related.filter(p => p.Cat_ID === currentProduct.Cat_ID);
  const otherCategories = related.filter(p => p.Cat_ID !== currentProduct.Cat_ID);
  related = [...sameCategory, ...otherCategories].slice(0, 3);

  const fragment = document.createDocumentFragment();

  related.forEach(item => {
    const card = document.createElement('article');
    card.className = 'product-card card-tilt-hover';

    const detailUrl = `product-detail.html?id=${encodeURIComponent(item.Product_ID)}`;
    const catName = DETAIL_STATE.categoryMap.get(item.Cat_ID)?.Cat_Name || 'Kiệt Tác';

    card.innerHTML = `
      <div class="product-card-media zoom-trigger is-loading">
        <div class="product-badge-group">
          ${item.Badge ? `<span class="badge-tag">${escapeHTML(item.Badge)}</span>` : ''}
          <span class="badge-tag badge-secondary">${escapeHTML(item.Wood_Type)}</span>
        </div>
        <img class="product-card-img zoom-target"
             src="${escapeHTML(item.Image_Main)}"
             alt="${escapeHTML(item.Name)}"
             loading="lazy"
             onload="this.classList.add('is-loaded'); this.closest('.is-loading')?.classList.remove('is-loading');"
             onerror="this.onerror=null; this.src='images/default-woodcraft.svg'; this.classList.add('is-loaded', 'is-fallback'); this.closest('.is-loading')?.classList.remove('is-loading');" />
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${escapeHTML(catName)}</span>
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
        <p class="product-card-desc">${escapeHTML(item.Short_Desc)}</p>
        <div class="product-card-footer">
          <div>
            <span class="product-price-label">Mức Giá Di Sản</span>
            <span class="product-price-value">${escapeHTML(item.Price_Display)}</span>
          </div>
          <a href="${detailUrl}" class="btn-card-detail">Chi Tiết</a>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  // Safety handler for cached images
  container.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      if (img.naturalWidth > 0) {
        img.classList.add('is-loaded');
        img.closest('.is-loading')?.classList.remove('is-loading');
      } else if (img.src) {
        img.onerror = null;
        img.src = 'images/default-woodcraft.svg';
        img.classList.add('is-loaded', 'is-fallback');
        img.closest('.is-loading')?.classList.remove('is-loading');
      }
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
  loadDetailPageData();
});
