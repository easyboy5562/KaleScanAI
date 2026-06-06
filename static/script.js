/* ── KaleScan · UI Logic ── */

const hasPrediction = window.KALESCAN_HAS_PREDICTION === true;

/* ── Step bar ── */
function setStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById('si' + i).className =
      'stepbar-item' + (i === n ? ' active' : i < n ? ' done' : '');
    const sn = document.getElementById('sn' + i);
    sn.className = 'sb-num' + (i === n ? ' active' : i < n ? ' done' : '');
    sn.textContent = i < n ? '✓' : i;
    document.getElementById('sl' + i).className =
      'sb-label' + (i === n ? ' active' : '');
  });
}

function showPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

if (hasPrediction) {
  setStep(3);
  showPanel('panel-result');
}

/* ── State ── */
let selFile = null;
let selUrl  = null;

/* ── Element refs ── */
const fileInput    = document.getElementById('file-input');
const dropZone     = document.getElementById('drop-zone');
const inlinePrev   = document.getElementById('inline-preview');
const inlineImg    = document.getElementById('inline-img');
const inlineFname  = document.getElementById('inline-fname');
const btnChange    = document.getElementById('btn-change');
const btnToConfirm = document.getElementById('btn-to-confirm');
const previewImg   = document.getElementById('preview-img');
const fileNameDisp = document.getElementById('file-name-display');
const btnBack      = document.getElementById('btn-back');
const btnReselect  = document.getElementById('btn-reselect');
const uploadForm   = document.getElementById('upload-form');
const hiddenInput  = document.getElementById('hidden-file-input');
const imgDataInput = document.getElementById('image-data-input');
const btnAnalyze   = document.getElementById('btn-analyze');

/* ── File loader ── */
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  selFile = file;
  const r = new FileReader();
  r.onload = e => {
    selUrl = e.target.result;
    inlineImg.src    = selUrl;
    inlineFname.textContent = file.name;
    dropZone.style.display  = 'none';
    inlinePrev.style.display = 'block';
    btnToConfirm.disabled   = false;
  };
  r.readAsDataURL(file);
}

function resetStep1() {
  selFile = null;
  selUrl  = null;
  fileInput.value          = '';
  inlinePrev.style.display = 'none';
  dropZone.style.display   = '';
  btnToConfirm.disabled    = true;
}

/* ── Events ── */
fileInput.addEventListener('change', function () { loadFile(this.files[0]); });

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('over'); });
dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('over');
  loadFile(e.dataTransfer.files[0]);
});

btnChange.addEventListener('click',   () => { resetStep1(); fileInput.click(); });
btnReselect.addEventListener('click', () => { resetStep1(); setStep(1); showPanel('panel-upload'); });
btnBack.addEventListener('click',     () => { setStep(1); showPanel('panel-upload'); });

btnToConfirm.addEventListener('click', () => {
  if (!selUrl) return;
  previewImg.src         = selUrl;
  fileNameDisp.textContent = selFile.name;
  setStep(2);
  showPanel('panel-confirm');
});

uploadForm.addEventListener('submit', function (e) {
  if (!selFile || !selUrl) { e.preventDefault(); return; }
  const dt = new DataTransfer();
  dt.items.add(selFile);
  hiddenInput.files    = dt.files;
  imgDataInput.value   = selUrl;
  btnAnalyze.disabled  = true;
  btnAnalyze.innerHTML = '<span class="spinner"></span>กำลังวิเคราะห์...';
  setStep(3);
});

/* ── Global restart ── */
function restartFlow() {
  resetStep1();
  setStep(1);
  showPanel('panel-upload');
}