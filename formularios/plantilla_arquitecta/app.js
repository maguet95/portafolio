document.addEventListener('DOMContentLoaded', function () {
  const generateBtn = document.getElementById('generateBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const form = document.getElementById('portfolioForm');
  const statusEl = document.getElementById('status');
  const addProjectBtn = document.getElementById('addProjectBtn');
  const projectsContainer = document.getElementById('projectsContainer');
  const projectTemplate = document.getElementById('projectTemplate');
  const addExperienceBtn = document.getElementById('addExperienceBtn');
  const experiencesContainer = document.getElementById('experiencesContainer');
  const experienceTemplate = document.getElementById('experienceTemplate');
  const addReferenceBtn = document.getElementById('addReferenceBtn');
  const referencesContainer = document.getElementById('referencesContainer');
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
  const MAX_FILES_PER_PROJECT = 8;

  // Multi-step form navigation
  let currentStep = 1;
  const totalSteps = 3;
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const prevButtons = document.querySelectorAll('.btn-prev');
  const nextButtons = document.querySelectorAll('.btn-next');

  function updateStepDisplay(){
    // Update form steps
    formSteps.forEach(step => {
      step.classList.remove('active');
      if(parseInt(step.dataset.step) === currentStep){
        step.classList.add('active');
      }
    });

    // Update progress indicator
    progressSteps.forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');
      if(stepNum === currentStep){
        step.classList.add('active');
      } else if(stepNum < currentStep){
        step.classList.add('completed');
      }
    });

    // Scroll to top smoothly
    window.scrollTo({top: 0, behavior: 'smooth'});

    // Save progress to localStorage
    localStorage.setItem('portfolioFormStep', currentStep);
  }

  function validateStep(step){
    const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if(!currentStepEl) return true;

    const requiredInputs = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalid = null;

    requiredInputs.forEach(input => {
      // Skip validation for checkbox groups (handle separately)
      if(input.type === 'checkbox' && input.name === 'objetivo_portafolio'){
        return;
      }

      if(input.type === 'checkbox'){
        if(!input.checked){
          input.classList.add('invalid');
          isValid = false;
          if(!firstInvalid) firstInvalid = input;
        } else {
          input.classList.remove('invalid');
        }
      } else if(!input.value.trim()){
        input.classList.add('invalid');
        isValid = false;
        if(!firstInvalid) firstInvalid = input;
      } else {
        input.classList.remove('invalid');
      }
    });

    if(!isValid && firstInvalid){
      firstInvalid.scrollIntoView({behavior: 'smooth', block: 'center'});
      firstInvalid.focus();
      showStatus('Por favor, completa todos los campos requeridos antes de continuar.');
      setTimeout(hideStatus, 4000);
    }

    return isValid;
  }

  function goToStep(step){
    if(step < 1 || step > totalSteps) return;
    
    // Validate current step before moving forward
    if(step > currentStep && !validateStep(currentStep)){
      return;
    }

    currentStep = step;
    updateStepDisplay();
  }

  // Event listeners for navigation buttons
  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep - 1));
  });

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep + 1));
  });

  // Restore saved step on page load
  const savedStep = localStorage.getItem('portfolioFormStep');
  if(savedStep){
    currentStep = parseInt(savedStep);
    updateStepDisplay();
  }

  // Clear saved progress on form reset
  form.addEventListener('reset', () => {
    localStorage.removeItem('portfolioFormStep');
    currentStep = 1;
    updateStepDisplay();
  });

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
    filesInput.addEventListener('change', function(){
      // Validar límite de 8 archivos
      if(this.files.length > MAX_FILES_PER_PROJECT){
        alert(`Solo puedes subir máximo ${MAX_FILES_PER_PROJECT} archivos por proyecto.`);
        this.value = '';
        updateProjectPreviews();
        return;
      }
      updateProjectPreviews();
    });

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

  // Funciones para referencias dinámicas
  function addReference(){
    const refItem = document.createElement('div');
    refItem.className = 'reference-item';
    refItem.innerHTML = `
      <label>URL de referencia (opcional)<input type="url" name="reference_url" placeholder="https://ejemplo.com"></label>
      <label>Comentarios sobre esta referencia<textarea name="reference_comment" placeholder="¿Qué te gusta de esta referencia?"></textarea></label>
      <button type="button" class="removeReferenceBtn btn-secondary" style="background:#ef4444;padding:6px 10px;margin-top:8px">Eliminar</button>
    `;
    const removeBtn = refItem.querySelector('.removeReferenceBtn');
    removeBtn.addEventListener('click', ()=> refItem.remove());
    referencesContainer.appendChild(refItem);
  }
  if(addReferenceBtn) addReferenceBtn.addEventListener('click', addReference);

  // Validar objetivos del portafolio (máximo 3)
  const objetivoCheckboxes = document.querySelectorAll('input[name="objetivo_portafolio"]');
  objetivoCheckboxes.forEach(cb => {
    cb.addEventListener('change', function(){
      const checked = document.querySelectorAll('input[name="objetivo_portafolio"]:checked');
      if(checked.length > 3){
        this.checked = false;
        alert('Solo puedes seleccionar hasta 3 objetivos principales.');
      }
    });
  });

  // Establecer fecha actual por defecto en firma
  const firmaFechaInput = document.querySelector('input[name="firma_fecha"]');
  if(firmaFechaInput && !firmaFechaInput.value){
    const today = new Date().toISOString().split('T')[0];
    firmaFechaInput.value = today;
  }

  // Función para descargar PDF resumen
  if(downloadPdfBtn){
    downloadPdfBtn.addEventListener('click', async function(){
      try{
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let y = 20;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;
        
        function addText(text, isBold = false){
          if(y > pageHeight - 20){
            doc.addPage();
            y = 20;
          }
          if(isBold){
            doc.setFont(undefined, 'bold');
          } else {
            doc.setFont(undefined, 'normal');
          }
          doc.text(text, 10, y);
          y += lineHeight;
        }

        const formData = new FormData(form);
        
        addText('RESUMEN DEL FORMULARIO - PORTAFOLIO ARQUITECTA', true);
        y += 3;
        addText(`Generado: ${new Date().toLocaleDateString()}`, false);
        y += 5;
        
        addText('1. IDENTIDAD PROFESIONAL', true);
        addText(`Nombre: ${formData.get('nombre') || 'N/A'}`);
        addText(`Cargo: ${formData.get('cargo') || 'N/A'}`);
        y += 3;
        
        addText('2. PÚBLICO OBJETIVO', true);
        addText(`Público objetivo: ${formData.get('publico_objetivo') || 'N/A'}`);
        const objetivos = Array.from(document.querySelectorAll('input[name="objetivo_portafolio"]:checked')).map(cb => cb.value).join(', ');
        addText(`Objetivos: ${objetivos || 'N/A'}`);
        addText(`Formato de entrega: ${formData.get('formato_entrega') || 'N/A'}`);
        y += 3;
        
        addText('3. EXPERIENCIAS', true);
        const expCards = experiencesContainer.querySelectorAll('.experience-card');
        addText(`Total de experiencias: ${expCards.length}`);
        y += 3;
        
        addText('4. PROYECTOS', true);
        const projCards = projectsContainer.querySelectorAll('.project-card');
        addText(`Total de proyectos: ${projCards.length}`);
        y += 3;
        
        addText('5. COMUNICACIÓN', true);
        addText(`Método preferido: ${formData.get('comunicacion_metodo') || 'N/A'}`);
        addText(`Horario: ${formData.get('horario_contacto') || 'N/A'}`);
        y += 3;
        
        addText('6. CONSENTIMIENTO', true);
        addText(`Firmado por: ${formData.get('firma_nombre') || 'N/A'}`);
        addText(`Fecha: ${formData.get('firma_fecha') || 'N/A'}`);
        
        doc.save(`${formData.get('nombre') || 'resumen'}_portafolio_resumen.pdf`);
        showStatus('PDF descargado correctamente.');
        setTimeout(hideStatus, 3000);
      }catch(err){
        console.error(err);
        alert('Error al generar PDF: ' + err.message);
      }
    });
  }

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

      md += mdSection('3.5. Público Objetivo y Metas',
        `**Público objetivo:** ${formData.get('publico_objetivo') || ''}\n`+
        `**Objetivos del portafolio:** ${Array.from(document.querySelectorAll('input[name="objetivo_portafolio"]:checked')).map(cb => cb.value).join(', ')}\n`+
        `**Resultados esperados:** ${formData.get('resultados_esperados') || ''}\n`+
        `**Formato de entrega:** ${formData.get('formato_entrega') || ''}\n`
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

      // 10. Referencias
      const refItems = referencesContainer.querySelectorAll('.reference-item');
      let refContent = '';
      refItems.forEach((item, idx) => {
        const url = item.querySelector('input[name="reference_url"]')?.value || '';
        const comment = item.querySelector('textarea[name="reference_comment"]')?.value || '';
        if(url || comment){
          refContent += `### Referencia ${idx+1}\n`;
          if(url) refContent += `**URL:** ${url}\n`;
          if(comment) refContent += `**Comentario:** ${comment}\n\n`;
        }
      });
      md += mdSection('10. Referencias e Inspiración', refContent || 'No se registraron referencias.');

      md += mdSection('11. Preferencias de Comunicación',
        `**Método preferido:** ${formData.get('comunicacion_metodo') || ''}\n`+
        `**Horario de contacto:** ${formData.get('horario_contacto') || ''}\n`
      );

      md += mdSection('12. Consentimiento y Firma',
        `**Nombre:** ${formData.get('firma_nombre') || ''}\n`+
        `**Fecha:** ${formData.get('firma_fecha') || ''}\n`+
        `**Consentimiento otorgado:** ${formData.get('consentimiento') ? 'Sí' : 'No'}\n`
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

