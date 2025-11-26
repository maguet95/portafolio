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
});

