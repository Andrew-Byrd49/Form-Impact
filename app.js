// Form Builder App
class FormBuilder {
    constructor() {
        this.fields = [];
        this.fieldIdCounter = 0;
        this.draggedFieldType = null;
        this.draggedFieldLabel = null;
        this.dropIndicator = null;
        this.styles = {
            bgColor: 'rgba(255, 255, 255, 1)',
            textColor: 'rgba(51, 51, 51, 1)',
            inputBgColor: 'rgba(255, 255, 255, 1)',
            inputTextColor: 'rgba(51, 51, 51, 1)',
            borderColor: 'rgba(204, 204, 204, 1)',
            borderWidth: 1,
            borderRadius: 4,
            buttonBgColor: 'rgba(217, 119, 87, 1)',
            buttonTextColor: 'rgba(255, 255, 255, 1)'
        };

        this.init();
    }

    init() {
        this.createDropIndicator();
        this.setupEventListeners();
        this.updatePreview();
    }

    createDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        this.dropIndicator.style.display = 'none';
    }

    setupEventListeners() {
        // Add field buttons drag events
        document.querySelectorAll('.add-field-btn').forEach(btn => {
            // Click to add
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const label = btn.dataset.label;
                this.addField(type, label);
            });

            // Drag from left panel
            btn.addEventListener('dragstart', (e) => {
                btn.classList.add('dragging');
                this.draggedFieldType = btn.dataset.type;
                this.draggedFieldLabel = btn.dataset.label;
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
            });

            btn.addEventListener('dragend', (e) => {
                btn.classList.remove('dragging');
                this.draggedFieldType = null;
                this.draggedFieldLabel = null;
                this.hideDropIndicator();
            });
        });

        // Form builder drop zone
        const formBuilder = document.getElementById('form-builder');

        formBuilder.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            formBuilder.classList.add('drag-over');

            // Calculate drop position
            if (this.draggedFieldType) {
                this.updateDropIndicator(e.clientY, formBuilder);
            }
        });

        formBuilder.addEventListener('dragleave', (e) => {
            if (e.target === formBuilder) {
                formBuilder.classList.remove('drag-over');
                this.hideDropIndicator();
            }
        });

        formBuilder.addEventListener('drop', (e) => {
            e.preventDefault();
            formBuilder.classList.remove('drag-over');
            this.hideDropIndicator();

            if (this.draggedFieldType) {
                const dropIndex = this.calculateDropIndex(e.clientY, formBuilder);
                this.addFieldAtIndex(this.draggedFieldType, this.draggedFieldLabel, dropIndex);
            }
        });

        // Setup color controls with opacity
        this.setupColorControl('bgColor');
        this.setupColorControl('textColor');
        this.setupColorControl('inputBgColor');
        this.setupColorControl('inputTextColor');
        this.setupColorControl('borderColor');
        this.setupColorControl('buttonBgColor');
        this.setupColorControl('buttonTextColor');

        // Border controls
        document.getElementById('borderWidth').addEventListener('input', (e) => {
            this.styles.borderWidth = e.target.value;
            document.getElementById('borderWidthValue').textContent = `${e.target.value}px`;
            this.updatePreview();
        });

        document.getElementById('borderRadius').addEventListener('input', (e) => {
            this.styles.borderRadius = e.target.value;
            document.getElementById('borderRadiusValue').textContent = `${e.target.value}px`;
            this.updatePreview();
        });

        // Modal preview
        document.getElementById('showPreviewBtn').addEventListener('click', () => {
            this.showModal();
        });

        document.getElementById('closePreviewBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.hideModal();
        });

        // Copy embed code
        document.getElementById('copyEmbedBtn').addEventListener('click', () => {
            this.copyEmbedCode();
        });
    }

    setupColorControl(colorName) {
        const colorInput = document.getElementById(colorName);
        const opacityInput = document.getElementById(`${colorName}Opacity`);
        const opacityValue = document.getElementById(`${colorName}OpacityValue`);

        const updateColor = () => {
            const hex = colorInput.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const opacity = parseInt(opacityInput.value) / 100;

            this.styles[colorName] = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            opacityValue.textContent = `${Math.round(opacity * 100)}%`;
            this.updatePreview();
        };

        colorInput.addEventListener('input', updateColor);
        opacityInput.addEventListener('input', updateColor);
    }

    hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    updateDropIndicator(mouseY, formBuilder) {
        const rect = formBuilder.getBoundingClientRect();
        const fields = formBuilder.querySelectorAll('.form-field');

        if (!formBuilder.contains(this.dropIndicator)) {
            formBuilder.appendChild(this.dropIndicator);
        }

        this.dropIndicator.style.display = 'block';

        if (fields.length === 0) {
            this.dropIndicator.style.top = '24px';
            return;
        }

        let closestY = 0;
        let minDistance = Infinity;

        fields.forEach(field => {
            const fieldRect = field.getBoundingClientRect();
            const fieldTop = fieldRect.top - rect.top + formBuilder.scrollTop;
            const fieldBottom = fieldTop + fieldRect.height;
            const fieldMiddle = (fieldTop + fieldBottom) / 2;

            const distanceToTop = Math.abs(mouseY - (fieldRect.top));
            const distanceToBottom = Math.abs(mouseY - (fieldRect.bottom));

            if (distanceToTop < minDistance) {
                minDistance = distanceToTop;
                closestY = fieldTop;
            }

            if (distanceToBottom < minDistance) {
                minDistance = distanceToBottom;
                closestY = fieldBottom;
            }
        });

        this.dropIndicator.style.top = `${closestY}px`;
    }

    hideDropIndicator() {
        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'none';
        }
    }

    calculateDropIndex(mouseY, formBuilder) {
        const fields = formBuilder.querySelectorAll('.form-field');

        if (fields.length === 0) {
            return 0;
        }

        for (let i = 0; i < fields.length; i++) {
            const rect = fields[i].getBoundingClientRect();
            const middle = rect.top + rect.height / 2;

            if (mouseY < middle) {
                return i;
            }
        }

        return fields.length;
    }

    addField(type, label) {
        this.addFieldAtIndex(type, label, this.fields.length);
    }

    addFieldAtIndex(type, label, index) {
        const field = {
            id: this.fieldIdCounter++,
            type: type,
            label: label,
            required: false,
            width: 12,
            options: type === 'dropdown' || type === 'multichoice' ? ['Option 1', 'Option 2', 'Option 3'] : [],
            consentText: type === 'consent' ? 'By checking this box, you agree to our terms and conditions. This may include receiving updates and information about our services.' : ''
        };

        this.fields.splice(index, 0, field);
        this.updatePreview();
    }

    removeField(id) {
        this.fields = this.fields.filter(field => field.id !== id);
        this.updatePreview();
    }

    updateFieldLabel(id, newLabel) {
        const field = this.fields.find(f => f.id === id);
        if (field) {
            field.label = newLabel;
            this.generateEmbedCode();
        }
    }

    updateFieldWidth(id, width) {
        const field = this.fields.find(f => f.id === id);
        if (field) {
            field.width = width;
            this.updatePreview();
        }
    }

    updateConsentText(id, text) {
        const field = this.fields.find(f => f.id === id);
        if (field) {
            field.consentText = text;
            this.generateEmbedCode();
        }
    }

    updateFieldOptions(id, options) {
        const field = this.fields.find(f => f.id === id);
        if (field) {
            field.options = options;
            this.updatePreview();
        }
    }

    addFieldOption(id, option) {
        const field = this.fields.find(f => f.id === id);
        if (field && field.options) {
            field.options.push(option);
            this.updatePreview();
        }
    }

    removeFieldOption(id, optionIndex) {
        const field = this.fields.find(f => f.id === id);
        if (field && field.options) {
            field.options.splice(optionIndex, 1);
            this.updatePreview();
        }
    }

    updateFieldOption(id, optionIndex, newValue) {
        const field = this.fields.find(f => f.id === id);
        if (field && field.options) {
            field.options[optionIndex] = newValue;
            this.generateEmbedCode();
        }
    }

    moveField(fromIndex, toIndex) {
        const field = this.fields.splice(fromIndex, 1)[0];
        this.fields.splice(toIndex, 0, field);
        this.updatePreview();
    }

    updatePreview() {
        const formBuilder = document.getElementById('form-builder');

        if (this.fields.length === 0) {
            formBuilder.innerHTML = '<p class="empty-state">Drag fields here to start building your form</p>';
            this.generateEmbedCode();
            return;
        }

        formBuilder.innerHTML = '';

        this.fields.forEach((field, index) => {
            const fieldElement = this.createFieldElement(field, index);
            formBuilder.appendChild(fieldElement);
        });

        // Add submit button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'form-submit-btn';
        submitBtn.textContent = 'Submit';
        submitBtn.style.backgroundColor = this.styles.buttonBgColor;
        submitBtn.style.color = this.styles.buttonTextColor;
        submitBtn.style.borderRadius = `${this.styles.borderRadius}px`;
        formBuilder.appendChild(submitBtn);

        // Apply global styles to form
        formBuilder.style.backgroundColor = this.styles.bgColor;
        formBuilder.style.color = this.styles.textColor;
        formBuilder.style.border = `${this.styles.borderWidth}px solid ${this.styles.borderColor}`;
        formBuilder.style.borderRadius = `${this.styles.borderRadius}px`;

        this.generateEmbedCode();
    }

    createFieldElement(field, index) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = `form-field col-${field.width}`;
        fieldDiv.draggable = true;
        fieldDiv.dataset.index = index;
        fieldDiv.dataset.fieldId = field.id;

        // Drag events for reordering
        this.setupFieldDragEvents(fieldDiv);

        // Field header
        const header = document.createElement('div');
        header.className = 'field-header';

        const labelContainer = document.createElement('div');
        labelContainer.className = 'field-label';

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰';

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'label-input';
        labelInput.value = field.label;
        labelInput.addEventListener('change', (e) => {
            this.updateFieldLabel(field.id, e.target.value);
        });

        labelContainer.appendChild(dragHandle);
        labelContainer.appendChild(labelInput);

        const actions = document.createElement('div');
        actions.className = 'field-actions';

        // Width controls (except for heading)
        if (field.type !== 'heading') {
            const widthControls = document.createElement('div');
            widthControls.className = 'width-controls';

            [12, 6, 4, 3].forEach(width => {
                const widthBtn = document.createElement('button');
                widthBtn.className = `width-btn ${field.width === width ? 'active' : ''}`;
                widthBtn.textContent = width === 12 ? 'Full' : width === 6 ? '1/2' : width === 4 ? '1/3' : '1/4';
                widthBtn.addEventListener('click', () => {
                    this.updateFieldWidth(field.id, width);
                });
                widthControls.appendChild(widthBtn);
            });

            actions.appendChild(widthControls);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'field-action-btn delete';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>';
        deleteBtn.addEventListener('click', () => {
            this.removeField(field.id);
        });

        actions.appendChild(deleteBtn);

        header.appendChild(labelContainer);
        header.appendChild(actions);

        fieldDiv.appendChild(header);

        // Create field-specific content
        const fieldContent = this.createFieldContent(field);
        fieldDiv.appendChild(fieldContent);

        return fieldDiv;
    }

    setupFieldDragEvents(fieldDiv) {
        fieldDiv.addEventListener('dragstart', (e) => {
            fieldDiv.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        fieldDiv.addEventListener('dragend', (e) => {
            fieldDiv.classList.remove('dragging');
            document.querySelectorAll('.form-field').forEach(f => {
                f.classList.remove('drag-over');
            });
        });

        fieldDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const draggingElement = document.querySelector('.form-field.dragging');
            if (draggingElement && draggingElement !== fieldDiv) {
                fieldDiv.classList.add('drag-over');
            }
        });

        fieldDiv.addEventListener('dragleave', (e) => {
            fieldDiv.classList.remove('drag-over');
        });

        fieldDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            fieldDiv.classList.remove('drag-over');

            const draggingElement = document.querySelector('.form-field.dragging');
            if (draggingElement && draggingElement !== fieldDiv) {
                const fromIndex = parseInt(draggingElement.dataset.index);
                const toIndex = parseInt(fieldDiv.dataset.index);
                this.moveField(fromIndex, toIndex);
            }
        });
    }

    createFieldContent(field) {
        const container = document.createElement('div');

        switch (field.type) {
            case 'heading':
                const heading = document.createElement('h3');
                heading.className = 'section-heading';
                heading.textContent = field.label;
                heading.contentEditable = true;
                heading.addEventListener('blur', (e) => {
                    this.updateFieldLabel(field.id, e.target.textContent);
                });
                return heading;

            case 'consent':
                const consentTextArea = document.createElement('textarea');
                consentTextArea.className = 'field-input';
                consentTextArea.value = field.consentText;
                consentTextArea.placeholder = 'Enter consent text...';
                consentTextArea.rows = 3;
                consentTextArea.addEventListener('change', (e) => {
                    this.updateConsentText(field.id, e.target.value);
                });

                const consentText = document.createElement('div');
                consentText.className = 'consent-text';
                consentText.textContent = field.consentText;

                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                const label = document.createElement('label');
                label.textContent = field.label;
                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);

                container.appendChild(consentTextArea);
                container.appendChild(document.createElement('hr'));
                container.appendChild(consentText);
                container.appendChild(checkboxItem);
                return container;

            case 'dropdown':
                const select = document.createElement('select');
                select.className = 'field-input';
                select.style.backgroundColor = this.styles.inputBgColor;
                select.style.color = this.styles.inputTextColor;
                select.style.border = `${this.styles.borderWidth}px solid ${this.styles.borderColor}`;
                select.style.borderRadius = `${this.styles.borderRadius}px`;

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an option...';
                select.appendChild(defaultOption);

                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    select.appendChild(option);
                });

                container.appendChild(select);
                container.appendChild(this.createOptionEditor(field));
                return container;

            case 'multichoice':
                const checkboxGroup = document.createElement('div');
                checkboxGroup.className = 'checkbox-group';

                field.options.forEach((opt, i) => {
                    const item = document.createElement('div');
                    item.className = 'checkbox-item';
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.id = `${field.id}_${i}`;
                    const lbl = document.createElement('label');
                    lbl.htmlFor = `${field.id}_${i}`;
                    lbl.textContent = opt;
                    item.appendChild(cb);
                    item.appendChild(lbl);
                    checkboxGroup.appendChild(item);
                });

                container.appendChild(checkboxGroup);
                container.appendChild(this.createOptionEditor(field));
                return container;

            case 'yesno':
                const radioGroup = document.createElement('div');
                radioGroup.className = 'radio-group';

                ['Yes', 'No'].forEach((opt) => {
                    const item = document.createElement('div');
                    item.className = 'radio-item';
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `field_${field.id}`;
                    radio.id = `${field.id}_${opt}`;
                    const lbl = document.createElement('label');
                    lbl.htmlFor = `${field.id}_${opt}`;
                    lbl.textContent = opt;
                    item.appendChild(radio);
                    item.appendChild(lbl);
                    radioGroup.appendChild(item);
                });
                return radioGroup;

            case 'textarea':
                const textarea = document.createElement('textarea');
                textarea.className = 'field-input';
                textarea.placeholder = `Enter ${field.label.toLowerCase()}...`;
                textarea.style.backgroundColor = this.styles.inputBgColor;
                textarea.style.color = this.styles.inputTextColor;
                textarea.style.border = `${this.styles.borderWidth}px solid ${this.styles.borderColor}`;
                textarea.style.borderRadius = `${this.styles.borderRadius}px`;
                return textarea;

            default:
                const input = document.createElement('input');
                input.className = 'field-input';
                input.type = field.type;
                input.placeholder = `Enter ${field.label.toLowerCase()}...`;
                input.style.backgroundColor = this.styles.inputBgColor;
                input.style.color = this.styles.inputTextColor;
                input.style.border = `${this.styles.borderWidth}px solid ${this.styles.borderColor}`;
                input.style.borderRadius = `${this.styles.borderRadius}px`;
                return input;
        }
    }

    createOptionEditor(field) {
        const editor = document.createElement('div');
        editor.className = 'option-editor';

        const title = document.createElement('div');
        title.className = 'option-editor-title';
        title.textContent = 'Edit Options';
        editor.appendChild(title);

        const optionList = document.createElement('div');
        optionList.className = 'option-list';

        field.options.forEach((opt, index) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = opt;
            input.addEventListener('change', (e) => {
                this.updateFieldOption(field.id, index, e.target.value);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕';
            deleteBtn.addEventListener('click', () => {
                this.removeFieldOption(field.id, index);
            });

            optionItem.appendChild(input);
            optionItem.appendChild(deleteBtn);
            optionList.appendChild(optionItem);
        });

        editor.appendChild(optionList);

        const addBtn = document.createElement('button');
        addBtn.className = 'add-option-btn';
        addBtn.textContent = '+ Add Option';
        addBtn.addEventListener('click', () => {
            this.addFieldOption(field.id, `Option ${field.options.length + 1}`);
        });

        editor.appendChild(addBtn);
        return editor;
    }

    showModal() {
        const modal = document.getElementById('previewModal');
        const modalContainer = document.getElementById('modalPreviewContainer');

        // Generate the form HTML and inject it
        const formHTML = this.generateFormHTML();
        const formCSS = this.generateFormCSS();

        modalContainer.innerHTML = `
            <style>${formCSS}</style>
            ${formHTML}
        `;

        // Prevent form submission in preview
        setTimeout(() => {
            const previewForm = modalContainer.querySelector('#form-impact-form');
            if (previewForm) {
                previewForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
            }
        }, 0);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        const modal = document.getElementById('previewModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    generateEmbedCode() {
        if (this.fields.length === 0) {
            document.getElementById('embedCode').innerHTML = '<code>&lt;!-- Your form will appear here after adding fields --&gt;</code>';
            return;
        }

        const formHTML = this.generateFormHTML();
        const formCSS = this.generateFormCSS();
        const formJS = this.generateFormJS();

        const embedCode = `<!-- Form Impact Embed Code -->
<div id="form-impact-container"></div>
<script>
(function() {
    // CSS
    const style = document.createElement('style');
    style.textContent = \`${formCSS}\`;
    document.head.appendChild(style);

    // HTML
    const container = document.getElementById('form-impact-container');
    container.innerHTML = \`${formHTML}\`;

    // JS
    ${formJS}
})();
</script>`;

        document.getElementById('embedCode').innerHTML = `<code>${this.escapeHtml(embedCode)}</code>`;
    }

    generateFormHTML() {
        let html = '<form id="form-impact-form" class="fi-form">\n';

        this.fields.forEach(field => {
            const fieldName = field.label.toLowerCase().replace(/\s+/g, '_');
            const colClass = field.width === 12 ? '' : ` fi-col-${field.width}`;

            switch (field.type) {
                case 'heading':
                    html += `  <h3 class="fi-heading">${field.label}</h3>\n`;
                    break;

                case 'consent':
                    html += `  <div class="fi-field${colClass}">\n`;
                    html += `    <div class="fi-consent-text">${field.consentText}</div>\n`;
                    html += `    <div class="fi-checkbox-item">\n`;
                    html += `      <input type="checkbox" id="${fieldName}" name="${fieldName}" required />\n`;
                    html += `      <label for="${fieldName}">${field.label}</label>\n`;
                    html += `    </div>\n`;
                    html += '  </div>\n';
                    break;

                case 'dropdown':
                    html += `  <div class="fi-field${colClass}">\n`;
                    html += `    <label class="fi-label">${field.label}</label>\n`;
                    html += `    <select name="${fieldName}" class="fi-input">\n`;
                    html += `      <option value="">Select an option...</option>\n`;
                    field.options.forEach(opt => {
                        html += `      <option value="${opt}">${opt}</option>\n`;
                    });
                    html += `    </select>\n`;
                    html += '  </div>\n';
                    break;

                case 'multichoice':
                    html += `  <div class="fi-field${colClass}">\n`;
                    html += `    <label class="fi-label">${field.label}</label>\n`;
                    html += `    <div class="fi-checkbox-group">\n`;
                    field.options.forEach((opt, i) => {
                        const optName = `${fieldName}_${i}`;
                        html += `      <div class="fi-checkbox-item">\n`;
                        html += `        <input type="checkbox" id="${optName}" name="${fieldName}[]" value="${opt}" />\n`;
                        html += `        <label for="${optName}">${opt}</label>\n`;
                        html += `      </div>\n`;
                    });
                    html += `    </div>\n`;
                    html += '  </div>\n';
                    break;

                case 'yesno':
                    html += `  <div class="fi-field${colClass}">\n`;
                    html += `    <label class="fi-label">${field.label}</label>\n`;
                    html += `    <div class="fi-radio-group">\n`;
                    ['Yes', 'No'].forEach((opt) => {
                        const optId = `${fieldName}_${opt.toLowerCase()}`;
                        html += `      <div class="fi-radio-item">\n`;
                        html += `        <input type="radio" id="${optId}" name="${fieldName}" value="${opt}" />\n`;
                        html += `        <label for="${optId}">${opt}</label>\n`;
                        html += `      </div>\n`;
                    });
                    html += `    </div>\n`;
                    html += '  </div>\n';
                    break;

                case 'textarea':
                    html += `  <div class="fi-field${colClass}">\n`;
                    html += `    <label class="fi-label">${field.label}</label>\n`;
                    html += `    <textarea name="${fieldName}" class="fi-input" placeholder="Enter ${field.label.toLowerCase()}..."></textarea>\n`;
                    html += '  </div>\n';
                    break;

                default:
                    html += `  <div class="fi-field${colClass}">\n`;
                    html += `    <label class="fi-label">${field.label}</label>\n`;
                    html += `    <input type="${field.type}" name="${fieldName}" class="fi-input" placeholder="Enter ${field.label.toLowerCase()}..." />\n`;
                    html += '  </div>\n';
            }
        });

        html += '  <button type="submit" class="fi-submit">Submit</button>\n';
        html += '</form>';

        return html;
    }

    generateFormCSS() {
        return `.fi-form {
    background-color: ${this.styles.bgColor};
    color: ${this.styles.textColor};
    border: ${this.styles.borderWidth}px solid ${this.styles.borderColor};
    border-radius: ${this.styles.borderRadius}px;
    padding: 24px;
    max-width: 800px;
    font-family: Arial, Helvetica, sans-serif;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
}
.fi-field {
    grid-column: span 12;
}
.fi-field.fi-col-6 {
    grid-column: span 6;
}
.fi-field.fi-col-4 {
    grid-column: span 4;
}
.fi-field.fi-col-3 {
    grid-column: span 3;
}
.fi-heading {
    grid-column: 1 / -1;
    font-size: 20px;
    font-weight: 600;
    color: ${this.styles.textColor};
    margin: 16px 0 8px 0;
    letter-spacing: -0.01em;
}
.fi-label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: ${this.styles.textColor};
    font-size: 14px;
}
.fi-input {
    width: 100%;
    padding: 10px 12px;
    background-color: ${this.styles.inputBgColor};
    color: ${this.styles.inputTextColor};
    border: ${this.styles.borderWidth}px solid ${this.styles.borderColor};
    border-radius: ${this.styles.borderRadius}px;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
    font-family: Arial, Helvetica, sans-serif;
}
.fi-input:focus {
    outline: none;
    border-color: ${this.styles.buttonBgColor};
}
textarea.fi-input {
    min-height: 80px;
    resize: vertical;
}
select.fi-input {
    cursor: pointer;
}
.fi-consent-text {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 12px;
}
.fi-checkbox-group,
.fi-radio-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.fi-checkbox-item,
.fi-radio-item {
    display: flex;
    align-items: center;
    gap: 8px;
}
.fi-checkbox-item input[type="checkbox"],
.fi-radio-item input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.fi-checkbox-item label,
.fi-radio-item label {
    font-size: 14px;
    color: ${this.styles.textColor};
    cursor: pointer;
}
.fi-submit {
    grid-column: 1 / -1;
    background-color: ${this.styles.buttonBgColor};
    color: ${this.styles.buttonTextColor};
    border: none;
    border-radius: ${this.styles.borderRadius}px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-top: 8px;
}
.fi-submit:hover {
    opacity: 0.9;
}
@media (max-width: 768px) {
    .fi-form {
        grid-template-columns: 1fr;
    }
    .fi-field {
        grid-column: span 1 !important;
    }
}`;
    }

    generateFormJS() {
        return `document.getElementById('form-impact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        console.log('Form submitted:', data);
        // Add your form submission logic here
        alert('Form submitted! Check console for data.');
    });`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    copyEmbedCode() {
        const codeElement = document.getElementById('embedCode');
        const code = codeElement.textContent;

        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copyEmbedBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.backgroundColor = '#90d89e';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy code. Please copy manually.');
        });
    }
}

// Initialize the form builder when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FormBuilder();
});
