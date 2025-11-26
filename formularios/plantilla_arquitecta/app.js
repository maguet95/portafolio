document.getElementById('generateBtn').addEventListener('click', async function () {
  const generateBtn = document.getElementById('generateBtn');
  const statusEl = document.getElementById('status');
  const form = document.getElementById('portfolioForm');
  const formData = new FormData(form);

  function showStatus(msg){
    if(!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.add('show');
  }
  function hideStatus(){ if(statusEl) statusEl.classList.remove('show'); }

  // Basic validations
  const maxFileSize = 15 * 1024 * 1024; // 15 MB per file
  const allowedTypes = ['image/', 'application/pdf', 'application/zip'];

  function validateFile(file){
    if(!file) return true;
    if(file.size > maxFileSize) return `El archivo ${file.name} excede el tamaño máximo de 15 MB.`;
    // allow image/* or pdf or zip
    if(allowedTypes.some(t => file.type.startsWith(t))) return true;
    if(file.name.endsWith('.zip')) return true;
    return `Tipo de archivo no permitido: ${file.name}`;
  }

  try{
    // disable button while processing
    generateBtn.disabled = true;
    showStatus('Validando archivos...');

    // check single files
    const singleKeys = ['foto','logo','firma'];
    for(const k of singleKeys){
      const f = formData.get(k);
      if(f && f.name){
        const ok = validateFile(f);
        if(ok !== true){ throw new Error(ok); }
      }
    }

    // check project files
    const projectFiles = document.querySelector('input[name="proyecto_files"]').files;
    for(let i=0;i<projectFiles.length;i++){
      const pf = projectFiles[i];
      const ok = validateFile(pf);
      if(ok !== true) throw new Error(ok);
    }

    showStatus('Generando ZIP... por favor espera');


  // Build Markdown content
  function mdSection(title, content){
    return `## ${title}\n\n${content}\n\n`;
  }

  let md = `# Datos para Portafolio — ${formData.get('nombre') || 'Nombre'}\n\n`;

  md += mdSection('1. Identidad Profesional',
    `**Nombre completo:** ${formData.get('nombre') || ''}\n`+
    `**Nombre profesional preferido:** ${formData.get('nombre_profesional') || ''}\n`+
    `**Cargo / Especialidad:** ${formData.get('cargo') || ''}\n`+
    `**Biografía:** ${formData.get('bio') || ''}\n`+
    `**Filosofía de diseño:** ${formData.get('filosofia') || ''}\n`+
    `**Estilos preferidos:** ${formData.get('estilos') || ''}\n`+
    `**Valores / Principios:** ${formData.get('valores') || ''}\n`
  );

  md += mdSection('2. Objetivo del Portafolio',
    `**Objetivo principal:** ${formData.get('objetivo') || ''}\n`+
    `**Empresas o estudios objetivo:** ${formData.get('empresas') || ''}\n`+
    `**Tipo de proyectos a atraer:** ${formData.get('proyectos_objetivo') || ''}\n`+
    `**Tono deseado:** ${formData.get('tono') || ''}\n`+
    `**Referencias:** ${formData.get('referencias') || ''}\n`
  );

  md += mdSection('3. Formación Académica',
    `**Títulos:** ${formData.get('titulos') || ''}\n`+
    `**Especialidades:** ${formData.get('especialidades') || ''}\n`+
    `**Cursos adicionales:** ${formData.get('cursos') || ''}\n`+
    `**Certificaciones:** ${formData.get('certificaciones') || ''}\n`
  );

  md += mdSection('4. Experiencia Profesional', formData.get('experiencias') || '');
  md += mdSection('5. Habilidades y Herramientas Técnicas',
    `**Software:** ${formData.get('software') || ''}\n`+
    `**Habilidades técnicas:** ${formData.get('habilidades_tecnicas') || ''}\n`+
    `**Soft skills:** ${formData.get('soft_skills') || ''}\n`
  );

  md += mdSection('6. Proyectos para el Portafolio', formData.get('proyectos') || '');
  md += mdSection('7. Estilo Visual Deseado',
    `**Paleta:** ${formData.get('paleta') || ''}\n`+
    `**Estilo visual:** ${formData.get('estilo_visual') || ''}\n`+
    `**Tipografías:** ${formData.get('tipografias') || ''}\n`+
    `**Formatos:** ${formData.get('formatos') || ''}\n`
  );

  md += mdSection('8. Personalidad Profesional',
    `**Lema:** ${formData.get('lema') || ''}\n`+
    `**Diferenciador:** ${formData.get('diferenciador') || ''}\n`+
    `**Metodología:** ${formData.get('metodologia') || ''}\n`+
    `**Testimonios:** ${formData.get('testimonios') || ''}\n`
  );

  md += mdSection('9. Elementos Extras',
    `**Redes:** ${formData.get('redes') || ''}\n`+
    `**Publicaciones / premios:** ${formData.get('distinciones') || ''}\n`+
    `**Disponibilidad:** ${formData.get('disponibilidad') || ''}\n`+
    `**Contacto:** ${formData.get('contacto') || ''}\n`+
    `**Preferencias de diseño:** ${formData.get('preferencias_diseno') || ''}\n`
  );

  md += `---\nGenerado desde el formulario web.`;

    // Create ZIP with markdown and attached files
    const zip = new JSZip();
    zip.file('formulario_portafolio_arquitecta.md', md);

    // Attach single files
    const possibleFiles = ['foto','logo','firma'];
    possibleFiles.forEach(key => {
      const f = formData.get(key);
      if (f && f.name) zip.file(`adjuntos/${f.name}`, f);
    });

    // Multiple project files
    for (let i=0;i<projectFiles.length;i++){
      const pf = projectFiles[i];
      zip.file(`proyectos/${pf.name}`, pf);
    }

    // Generate ZIP and trigger download
    const blob = await zip.generateAsync({type:'blob'});
    saveAs(blob, `${(formData.get('nombre')||'portfolio').replace(/\s+/g,'_')}_datos_portafolio.zip`);
    showStatus('Listo — descarga iniciada.');
  }catch(err){
    console.error(err);
    showStatus('Error: ' + (err.message || err));
    alert('Error: ' + (err.message || err));
  }finally{
    generateBtn.disabled = false;
    setTimeout(hideStatus, 4000);
  }
// Enhanced app.js: preview attachments, modal confirmation, extra validations
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB per file
const MAX_TOTAL_SIZE = 120 * 1024 * 1024; // 120MB total
const MAX_FILE_COUNT = 60;

const form = document.getElementById('portfolioForm');
const generateBtn = document.getElementById('generateBtn');
const statusEl = document.getElementById('status');
const projectFilesInput = document.getElementById('proyecto_files');
const attachmentsPreview = document.getElementById('attachmentsPreview');
const confirmModal = document.getElementById('confirmModal');
const modalSummary = document.getElementById('modalSummary');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

function showStatus(msg){ if(statusEl){ statusEl.textContent = msg; statusEl.classList.add('show'); }}
function hideStatus(){ if(statusEl){ statusEl.classList.remove('show'); }}

function formatBytes(bytes){
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(2) + ' MB';
}

function validateFile(file){
  if(!file) return true;
  if(file.size > MAX_FILE_SIZE) return `El archivo ${file.name} excede el tamaño máximo de 15 MB.`;
  const allowed = ['image/', 'application/pdf'];
  if(allowed.some(t => file.type.startsWith(t))) return true;
  if(file.name.toLowerCase().endsWith('.zip')) return true;
  return `Tipo de archivo no permitido: ${file.name}`;
}

function generatePreview(){
  attachmentsPreview.innerHTML = '';
  const files = projectFilesInput.files;
  if(!files || files.length === 0) return;
  const list = document.createElement('div');
  list.className = 'preview-list';
  let total = 0;
  for(let i=0;i<files.length;i++){
    const f = files[i];
    total += f.size;
    const item = document.createElement('div');
    item.className = 'preview-item';
    const name = document.createElement('div');
    name.textContent = f.name + ' — ' + formatBytes(f.size);
    item.appendChild(name);
    if(f.type.startsWith('image/')){
      const img = document.createElement('img');
      img.className = 'preview-thumb';
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(f);
      item.appendChild(img);
    }
    list.appendChild(item);
  }
  const summary = document.createElement('div');
  summary.className = 'preview-summary';
  summary.textContent = `Archivos: ${files.length} — Tamaño total: ${formatBytes(total)}`;
  attachmentsPreview.appendChild(summary);
  attachmentsPreview.appendChild(list);
}

projectFilesInput && projectFilesInput.addEventListener('change', () => {
  // quick validations
  const files = projectFilesInput.files;
  if(files.length > MAX_FILE_COUNT){ alert('Número de archivos excede el máximo permitido ('+MAX_FILE_COUNT+').'); projectFilesInput.value = ''; attachmentsPreview.innerHTML = ''; return; }
  let total=0;
  for(let i=0;i<files.length;i++){
    const ok = validateFile(files[i]); if(ok !== true){ alert(ok); projectFilesInput.value=''; attachmentsPreview.innerHTML=''; return; }
    total += files[i].size;
  }
  if(total > MAX_TOTAL_SIZE){ alert('El tamaño total de archivos excede el máximo permitido ('+formatBytes(MAX_TOTAL_SIZE)+').'); projectFilesInput.value=''; attachmentsPreview.innerHTML=''; return; }
  generatePreview();
});

function showModal(summaryHtml){
  modalSummary.innerHTML = summaryHtml;
  confirmModal.setAttribute('aria-hidden','false');
  confirmModal.classList.add('open');
  return new Promise(resolve => {
    function onConfirm(){ cleanup(); resolve(true); }
    function onCancel(){ cleanup(); resolve(false); }
    function cleanup(){ modalConfirm.removeEventListener('click', onConfirm); modalCancel.removeEventListener('click', onCancel); confirmModal.classList.remove('open'); confirmModal.setAttribute('aria-hidden','true'); }
    modalConfirm.addEventListener('click', onConfirm);
    modalCancel.addEventListener('click', onCancel);
  });
}

async function handleGenerate(){
  const formData = new FormData(form);
  // Validate single files
  const singleKeys = ['foto','logo','firma'];
  for(const k of singleKeys){ const f = formData.get(k); if(f && f.name){ const ok = validateFile(f); if(ok !== true){ alert(ok); return; } } }

  // Validate project files again
  const files = projectFilesInput.files;
  let total=0; for(let i=0;i<files.length;i++){ total += files[i].size; }
  if(files.length > MAX_FILE_COUNT){ alert('Número de archivos excede el máximo permitido.'); return; }
  if(total > MAX_TOTAL_SIZE){ alert('Tamaño total de archivos excede el máximo permitido.'); return; }

  // Build markdown preview
  let md = `# Datos para Portafolio — ${formData.get('nombre') || 'Nombre'}\n\n`;
  function mdSection(title, content){ return `## ${title}\n\n${content}\n\n`; }
  md += mdSection('1. Identidad Profesional', `**Nombre completo:** ${formData.get('nombre') || ''}\n`+`**Cargo / Especialidad:** ${formData.get('cargo') || ''}\n`+`**Biografía:** ${formData.get('bio') || ''}`);
  md += mdSection('2. Objetivo del Portafolio', `**Objetivo principal:** ${formData.get('objetivo') || ''}`);
  md += mdSection('3. Formación Académica', `${formData.get('titulos') || ''}`);
  md += mdSection('4. Experiencia Profesional', formData.get('experiencias') || '');
  md += mdSection('5. Habilidades y Herramientas Técnicas', formData.get('software') || '');
  md += mdSection('6. Proyectos para el Portafolio', formData.get('proyectos') || '');
  md += mdSection('7. Estilo Visual Deseado', formData.get('estilo_visual') || '');
  md += mdSection('8. Personalidad Profesional', formData.get('lema') || '');
  md += mdSection('9. Elementos Extras', formData.get('redes') || '');
  md += `---\nGenerado desde el formulario web.`;

  // Prepare modal summary
  const summaryHtml = `<p><strong>Nombre:</strong> ${formData.get('nombre') || ''}</p><p><strong>Archivos adjuntos:</strong> ${files.length} — ${formatBytes(total)}</p><p>¿Confirmas la generación del ZIP con esta información?</p>`;
  const confirmed = await showModal(summaryHtml);
  if(!confirmed) return;

  // proceed to zip
  try{
    generateBtn.disabled = true; showStatus('Generando ZIP — por favor espera...');
    const zip = new JSZip(); zip.file('formulario_portafolio_arquitecta.md', md);
    // single files
    ['foto','logo','firma'].forEach(k=>{ const f = formData.get(k); if(f && f.name) zip.file(`adjuntos/${f.name}`, f); });
    // project files
    for(let i=0;i<files.length;i++){ zip.file(`proyectos/${files[i].name}`, files[i]); }
    const blob = await zip.generateAsync({type:'blob'});
    saveAs(blob, `${(formData.get('nombre')||'portfolio').replace(/\s+/g,'_')}_datos_portafolio.zip`);
    showStatus('Listo — descarga iniciada.');
  }catch(err){ console.error(err); alert('Error al generar ZIP: '+(err.message||err)); showStatus('Error: '+(err.message||err)); }
  finally{ generateBtn.disabled=false; setTimeout(hideStatus,4000); }
}

generateBtn && generateBtn.addEventListener('click', handleGenerate);
});

