document.addEventListener('DOMContentLoaded', function () {
  const generateBtn = document.getElementById('generateBtn');
  const form = document.getElementById('portfolioForm');
  const statusEl = document.getElementById('status');
  const addProjectBtn = document.getElementById('addProjectBtn');
  const projectsContainer = document.getElementById('projectsContainer');
  const projectTemplate = document.getElementById('projectTemplate');
  const addExperienceBtn = document.getElementById('addExperienceBtn');
  const experiencesContainer = document.getElementById('experiencesContainer');
  const experienceTemplate = document.getElementById('experienceTemplate');
  const attachmentsPreview = document.getElementById('attachmentsPreview');
  const fileCount = document.getElementById('fileCount');
  const fotoInput = document.querySelector('input[name="foto"]');
  const logoInput = document.querySelector('input[name="logo"]');
  const confirmModal = document.getElementById('confirmModal');
  const modalSummary = document.getElementById('modalSummary');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB per file
  const MAX_TOTAL_SIZE = 120 * 1024 * 1024; // 120MB total
  const MAX_FILE_COUNT = 60;

  function showStatus(msg){
    if(!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.add('show');
  }
  
  function hideStatus(){ 
    if(statusEl) statusEl.classList.remove('show'); 
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function validateFile(file){
    if(!file) return true;
    if(file.size > MAX_FILE_SIZE) return `El archivo ${file.name} excede el tamaño máximo de 15 MB.`;
    const allowed = ['image/', 'application/pdf', 'application/zip'];
    if(allowed.some(t => file.type.startsWith(t))) return true;
    if(file.name.toLowerCase().endsWith('.zip')) return true;
    return `Tipo de archivo no permitido: ${file.name}`;
  }

  function clearPreview(){
    attachmentsPreview.innerHTML = '';
    fileCount.textContent = '';
  }

  function addPreviewItem(labelText, file){
    const item = document.createElement('div');
    item.className = 'preview-item';
    const label = document.createElement('div');
    label.className = 'preview-label';
    label.textContent = labelText;
    item.appendChild(label);

    if (file.type.startsWith('image/')){
      const img = document.createElement('img');
      img.className = 'preview-thumb';
      const reader = new FileReader();
      reader.onload = e => img.src = e.target.result;
      reader.readAsDataURL(file);
      item.appendChild(img);
    } else {
      const info = document.createElement('div');
      info.className = 'preview-info';
      info.textContent = `${file.name} (${formatBytes(file.size)})`;
      item.appendChild(info);
    }

    attachmentsPreview.appendChild(item);
  }

  function updateProjectPreviews(){
    attachmentsPreview.innerHTML = '';
    let total = 0;
    // recorrer archivos por proyecto
    const projectCards = projectsContainer.querySelectorAll('.project-card');
    projectCards.forEach((card, idx) => {
      const filesInput = card.querySelector('input[name="project_files"]');
      if (filesInput && filesInput.files){
        for (let i=0;i<filesInput.files.length;i++){
          addPreviewItem(`Proyecto ${idx+1}: ${filesInput.files[i].name}`, filesInput.files[i]);
          total++;
        }
      }
    });
    // foto & logo previews
    if (fotoInput && fotoInput.files && fotoInput.files[0]){ addPreviewItem('Foto profesional', fotoInput.files[0]); total++; }
    if (logoInput && logoInput.files && logoInput.files[0]){ addPreviewItem('Logo personal', logoInput.files[0]); total++; }
    fileCount.textContent = total ? `Archivos adjuntos: ${total}` : '';
  }
  
  if (fotoInput) fotoInput.addEventListener('change', updateProjectPreviews);
  if (logoInput) logoInput.addEventListener('change', updateProjectPreviews);

  function addProject(initial){
    const tpl = projectTemplate.content.cloneNode(true);
    const card = tpl.querySelector('.project-card');
    const removeBtn = card.querySelector('.removeProjectBtn');
    const title = card.querySelector('.project-title');
    const nameInput = card.querySelector('input[name="project_name"]');

    // fill with initial data if provided
    if (initial && initial.name) nameInput.value = initial.name;

    nameInput.addEventListener('input', ()=>{
      title.textContent = nameInput.value ? nameInput.value : 'Proyecto';
    });

    removeBtn.addEventListener('click', ()=>{
      card.remove();
      updateProjectPreviews();
    });

    // update previews when files change
    const filesInput = card.querySelector('input[name="project_files"]');
    filesInput.addEventListener('change', updateProjectPreviews);

    projectsContainer.appendChild(card);
    // update previews/count
    updateProjectPreviews();
    return card;
  }

  // Añadir primer proyecto por defecto
  if (addProjectBtn) addProjectBtn.addEventListener('click', ()=> addProject());
  addProject();

  // Funciones para experiencias laborales
  function addExperience(initial){
    const tpl = experienceTemplate.content.cloneNode(true);
    const card = tpl.querySelector('.experience-card');
    const removeBtn = card.querySelector('.removeExperienceBtn');
    const title = card.querySelector('.experience-title');
    const companyInput = card.querySelector('input[name="exp_company"]');
    const positionInput = card.querySelector('input[name="exp_position"]');

    // fill with initial data if provided
    if (initial && initial.company) companyInput.value = initial.company;
    if (initial && initial.position) positionInput.value = initial.position;

    function updateTitle(){
      const company = companyInput.value || '';
      const position = positionInput.value || '';
      if(company && position) {
        title.textContent = `${position} en ${company}`;
      } else if(company) {
        title.textContent = company;
      } else if(position) {
        title.textContent = position;
      } else {
        title.textContent = 'Experiencia';
      }
    }

    companyInput.addEventListener('input', updateTitle);
    positionInput.addEventListener('input', updateTitle);

    removeBtn.addEventListener('click', ()=>{
      card.remove();
    });

    experiencesContainer.appendChild(card);
    return card;
  }

  // Añadir primera experiencia por defecto
  if (addExperienceBtn) addExperienceBtn.addEventListener('click', ()=> addExperience());
  addExperience();

  function showModal(summaryHtml){
    if(!confirmModal) return Promise.resolve(true);
    modalSummary.innerHTML = summaryHtml;
    confirmModal.setAttribute('aria-hidden','false');
    confirmModal.classList.add('open');
    return new Promise(resolve => {
      function onConfirm(){ cleanup(); resolve(true); }
      function onCancel(){ cleanup(); resolve(false); }
      function cleanup(){ 
        modalConfirm.removeEventListener('click', onConfirm); 
        modalCancel.removeEventListener('click', onCancel); 
        confirmModal.classList.remove('open'); 
        confirmModal.setAttribute('aria-hidden','true'); 
      }
      modalConfirm.addEventListener('click', onConfirm);
      modalCancel.addEventListener('click', onCancel);
    });
  }

  generateBtn.addEventListener('click', async function () {
    const formData = new FormData(form);

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

      // check project files from all project cards
      const projectCards = projectsContainer.querySelectorAll('.project-card');
      let totalProjectFiles = 0;
      let totalSize = 0;
      projectCards.forEach((card) => {
        const filesInput = card.querySelector('input[name="project_files"]');
        if (filesInput && filesInput.files){
          for (let i=0;i<filesInput.files.length;i++){
            const pf = filesInput.files[i];
            const ok = validateFile(pf);
            if(ok !== true) throw new Error(ok);
            totalProjectFiles++;
            totalSize += pf.size;
          }
        }
      });

      if(totalProjectFiles > MAX_FILE_COUNT){ 
        throw new Error(`Número de archivos excede el máximo permitido (${MAX_FILE_COUNT}).`); 
      }
      if(totalSize > MAX_TOTAL_SIZE){ 
        throw new Error(`Tamaño total de archivos excede el máximo permitido (${formatBytes(MAX_TOTAL_SIZE)}).`); 
      }

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

      // 4. Experiencia Profesional: construir a partir de tarjetas dinámicas
      const experienceCards = experiencesContainer.querySelectorAll('.experience-card');
      let experienciasContent = '';
      experienceCards.forEach((card, idx) => {
        const get = name => (card.querySelector(`[name="${name}"]`) && card.querySelector(`[name="${name}"]`).value) ? card.querySelector(`[name="${name}"]`).value : '';
        const company = get('exp_company') || `Empresa ${idx+1}`;
        const position = get('exp_position') || 'Cargo no especificado';
        experienciasContent += `### ${position} — ${company}\n\n`;
        experienciasContent += `**Período:** ${get('exp_start')} - ${get('exp_end')}\n`;
        experienciasContent += `**Ubicación:** ${get('exp_location')}\n\n`;
        experienciasContent += `**Responsabilidades:**\n${get('exp_responsibilities')}\n\n`;
        experienciasContent += `**Logros:**\n${get('exp_achievements')}\n\n`;
        experienciasContent += `**Herramientas:** ${get('exp_tools')}\n\n`;
      });
      md += mdSection('4. Experiencia Profesional', experienciasContent || 'No se registraron experiencias.');
      
      md += mdSection('5. Habilidades y Herramientas Técnicas',
        `**Software:** ${formData.get('software') || ''}\n`+
        `**Habilidades técnicas:** ${formData.get('habilidades_tecnicas') || ''}\n`+
        `**Soft skills:** ${formData.get('soft_skills') || ''}\n`
      );

      // 6. Proyectos: construir a partir de tarjetas dinámicas
      let proyectosContent = '';
      projectCards.forEach((card, idx) => {
        const get = name => (card.querySelector(`[name="${name}"]`) && card.querySelector(`[name="${name}"]`).value) ? card.querySelector(`[name="${name}"]`).value : '';
        const pname = get('project_name') || `Proyecto ${idx+1}`;
        proyectosContent += `### ${pname} \n\n`;
        proyectosContent += `**Año:** ${get('project_year')}\n`;
        proyectosContent += `**Cliente:** ${get('project_client')}\n`;
        proyectosContent += `**Ubicación:** ${get('project_location')}\n`;
        proyectosContent += `**Tipo:** ${get('project_type')}\n`;
        proyectosContent += `**Rol:** ${get('project_role')}\n\n`;
        proyectosContent += `**Problema / Reto:** ${get('project_problem')}\n\n`;
        proyectosContent += `**Concepto:** ${get('project_concept')}\n\n`;
        proyectosContent += `**Proceso:** ${get('project_process')}\n\n`;
        proyectosContent += `**Solución / Resultado:** ${get('project_solution')}\n\n`;
        proyectosContent += `**Impacto:** ${get('project_impact')}\n\n`;
        proyectosContent += `**Software:** ${get('project_software')}\n\n`;
        proyectosContent += `**Créditos:** ${get('project_credits')}\n\n`;
      });
      md += mdSection('6. Proyectos para el Portafolio', proyectosContent || 'No se registraron proyectos.');
      
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

      // Prepare modal summary
      const summaryHtml = `<p><strong>Nombre:</strong> ${formData.get('nombre') || ''}</p><p><strong>Experiencias:</strong> ${experienceCards.length}</p><p><strong>Proyectos:</strong> ${projectCards.length}</p><p><strong>Archivos adjuntos:</strong> ${totalProjectFiles} — ${formatBytes(totalSize)}</p><p>¿Confirmas la generación del ZIP con esta información?</p>`;
      const confirmed = await showModal(summaryHtml);
      if(!confirmed) {
        generateBtn.disabled = false;
        hideStatus();
        return;
      }

      showStatus('Generando ZIP... por favor espera');

      // Create ZIP with markdown and attached files
      const zip = new JSZip();
      zip.file('formulario_portafolio_arquitecta.md', md);

      // Attach single files (foto, logo, firma)
      singleKeys.forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input && input.files && input.files[0]){
          const f = input.files[0];
          zip.file(`adjuntos/${f.name}`, f);
        }
      });

      // Añadir archivos por proyecto
      const projectCardsForZip = projectsContainer.querySelectorAll('.project-card');
      projectCardsForZip.forEach((card, idx) => {
        const pname = (card.querySelector('[name="project_name"]') && card.querySelector('[name="project_name"]').value) ? card.querySelector('[name="project_name"]').value : `proyecto_${idx+1}`;
        const safeName = pname.replace(/[^a-z0-9\-_]/gi, '_').replace(/_+/g,'_');
        const filesInput = card.querySelector('input[name="project_files"]');
        if (filesInput && filesInput.files){
          for (let i=0;i<filesInput.files.length;i++){
            const pf = filesInput.files[i];
            zip.file(`proyectos/${safeName}/${pf.name}`, pf);
          }
        }
      });

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
  });
});

