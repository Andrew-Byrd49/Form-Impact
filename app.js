// Form Builder App
class FormBuilder {
    constructor() {
        this.fields = [];
        this.fieldIdCounter = 0;
        this.styles = {
            bgColor: '#ffffff',
            textColor: '#333333',
            inputBgColor: '#ffffff',
            inputTextColor: '#333333',
            borderColor: '#cccccc',
            borderWidth: 1,
            borderRadius: 4,
            buttonBgColor: '#007bff',
            buttonTextColor: '#ffffff'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePreview();
    }

    setupEventListeners() {
        // Add field buttons
        document.querySelectorAll('.add-field-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const label = btn.dataset.label;
                this.addField(type, label);
            });
        });

        // Style controls
        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.styles.bgColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('textColor').addEventListener('input', (e) => {
            this.styles.textColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('inputBgColor').addEventListener('input', (e) => {
            this.styles.inputBgColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('inputTextColor').addEventListener('input', (e) => {
            this.styles.inputTextColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('borderColor').addEventListener('input', (e) => {
            this.styles.borderColor = e.target.value;
            this.updatePreview();
        });

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

        document.getElementById('buttonBgColor').addEventListener('input', (e) => {
            this.styles.buttonBgColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('buttonTextColor').addEventListener('input', (e) => {
            this.styles.buttonTextColor = e.target.value;
            this.updatePreview();
        });

        // Copy embed code button
        document.getElementById('copyEmbedBtn').addEventListener('click', () => {
            this.copyEmbedCode();
        });
    }

    addField(type, label) {
        const field = {
            id: this.fieldIdCounter++,
            type: type,
            label: label,
            required: false
        };

        this.fields.push(field);
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

    moveField(fromIndex, toIndex) {
        const field = this.fields.splice(fromIndex, 1)[0];
        this.fields.splice(toIndex, 0, field);
        this.updatePreview();
    }

    updatePreview() {
        const formBuilder = document.getElementById('form-builder');

        if (this.fields.length === 0) {
            formBuilder.innerHTML = '<p class="empty-state">Add fields from the left to start building your form</p>';
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
        fieldDiv.className = 'form-field';
        fieldDiv.draggable = true;
        fieldDiv.dataset.index = index;
        fieldDiv.dataset.fieldId = field.id;

        // Drag events
        fieldDiv.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        });

        fieldDiv.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.form-field').forEach(f => {
                f.classList.remove('drag-over');
            });
        });

        fieldDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const draggingElement = document.querySelector('.dragging');
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

            const draggingElement = document.querySelector('.dragging');
            if (draggingElement && draggingElement !== fieldDiv) {
                const fromIndex = parseInt(draggingElement.dataset.index);
                const toIndex = parseInt(fieldDiv.dataset.index);
                this.moveField(fromIndex, toIndex);
            }
        });

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

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'field-action-btn delete';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => {
            this.removeField(field.id);
        });

        actions.appendChild(deleteBtn);

        header.appendChild(labelContainer);
        header.appendChild(actions);

        // Field input
        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.placeholder = `Enter ${field.label.toLowerCase()}...`;
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.placeholder = `Enter ${field.label.toLowerCase()}...`;
        }

        input.className = 'field-input';
        input.style.backgroundColor = this.styles.inputBgColor;
        input.style.color = this.styles.inputTextColor;
        input.style.border = `${this.styles.borderWidth}px solid ${this.styles.borderColor}`;
        input.style.borderRadius = `${this.styles.borderRadius}px`;

        fieldDiv.appendChild(header);
        fieldDiv.appendChild(input);

        return fieldDiv;
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
            html += '  <div class="fi-field">\n';
            html += `    <label class="fi-label">${field.label}</label>\n`;

            if (field.type === 'textarea') {
                html += `    <textarea name="${field.label.toLowerCase().replace(/\s+/g, '_')}" class="fi-input" placeholder="Enter ${field.label.toLowerCase()}..."></textarea>\n`;
            } else {
                html += `    <input type="${field.type}" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" class="fi-input" placeholder="Enter ${field.label.toLowerCase()}..." />\n`;
            }

            html += '  </div>\n';
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
    padding: 20px;
    max-width: 600px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
.fi-field {
    margin-bottom: 15px;
}
.fi-label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: ${this.styles.textColor};
}
.fi-input {
    width: 100%;
    padding: 10px;
    background-color: ${this.styles.inputBgColor};
    color: ${this.styles.inputTextColor};
    border: ${this.styles.borderWidth}px solid ${this.styles.borderColor};
    border-radius: ${this.styles.borderRadius}px;
    font-size: 14px;
    box-sizing: border-box;
}
.fi-input:focus {
    outline: none;
    border-color: ${this.styles.buttonBgColor};
}
textarea.fi-input {
    min-height: 80px;
    resize: vertical;
}
.fi-submit {
    background-color: ${this.styles.buttonBgColor};
    color: ${this.styles.buttonTextColor};
    border: none;
    border-radius: ${this.styles.borderRadius}px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}
.fi-submit:hover {
    opacity: 0.9;
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
            btn.style.backgroundColor = '#28a745';

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
