// Global variables to store schema information and current message
let schemaInfo = null;
let currentMessage = null;
let editor = null;

// Theme handling
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (editor) {
            monaco.editor.setTheme('vs-dark');
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (editor) {
            monaco.editor.setTheme('vs');
        }
    }
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize Monaco Editor
function initMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs' } });

    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('editor-container'), {
            value: '',
            language: 'json',
            theme: getTheme() === 'dark' ? 'vs-dark' : 'vs',
            minimap: { enabled: false },
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
            }
        });

        // Add format command to editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
            formatJson();
        });
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    setTheme(getTheme());
    
    // Add theme toggle event listener
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    initMonacoEditor();
    initializeValidator();
});

/**
 * Initialize the validator by loading schema information from backend
 */
async function initializeValidator() {
    try {
        showResult('Loading AsyncAPI schema...', 'info');
        
        const response = await fetch('/api/schema-info');
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load schema');
        }
        
        schemaInfo = result.data;
        populateMessageSelector();
        await updateCurrentSchemaInfo();
        showResult('AsyncAPI schema loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading schema:', error);
        showResult('Error loading AsyncAPI schema: ' + error.message, 'error');
        updateCurrentSchemaInfo('Error loading schema');
    }
}

/**
 * Load schema from URL
 */
async function loadSchemaFromUrl() {
    const schemaUrl = document.getElementById('schemaUrl').value.trim();
    const loadSchemaBtn = document.getElementById('loadSchemaBtn');
    const loadSchemaBtnText = document.getElementById('loadSchemaBtnText');
    const loadSchemaSpinner = document.getElementById('loadSchemaSpinner');
    
    if (!schemaUrl) {
        showResult('Please enter a schema URL', 'error');
        return;
    }
    
    // Show loading state
    loadSchemaBtn.disabled = true;
    loadSchemaBtnText.style.display = 'none';
    loadSchemaSpinner.style.display = 'inline-flex';
    
    try {
        const response = await fetch('/api/schema/load-from-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: schemaUrl })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load schema from URL');
        }
        
        // Reload schema info
        await reloadSchemaInfo();
        
        showResult(`Schema loaded successfully: ${result.data.title} v${result.data.version}`, 'success');
        
    } catch (error) {
        console.error('Error loading schema from URL:', error);
        showResult('Error loading schema: ' + error.message, 'error');
    } finally {
        // Reset loading state
        loadSchemaBtn.disabled = false;
        loadSchemaBtnText.style.display = 'inline-flex';
        loadSchemaSpinner.style.display = 'none';
    }
}

/**
 * Use default schema
 */
async function useDefaultSchema() {
    const loadSchemaBtn = document.getElementById('loadSchemaBtn');
    const loadSchemaBtnText = document.getElementById('loadSchemaBtnText');
    const loadSchemaSpinner = document.getElementById('loadSchemaSpinner');
    
    // Show loading state
    loadSchemaBtn.disabled = true;
    loadSchemaBtnText.style.display = 'none';
    loadSchemaSpinner.style.display = 'inline-flex';
    
    try {
        const response = await fetch('/api/schema/reset-default', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load default schema');
        }
        
        // Clear the URL input
        document.getElementById('schemaUrl').value = '';
        
        // Reload schema info
        await reloadSchemaInfo();
        
        showResult(`✅ Default schema loaded: ${result.data.title} v${result.data.version}`, 'success');
        
    } catch (error) {
        console.error('Error loading default schema:', error);
        showResult('Error loading default schema: ' + error.message, 'error');
    } finally {
        // Reset loading state
        loadSchemaBtn.disabled = false;
        loadSchemaBtnText.style.display = 'inline-flex';
        loadSchemaSpinner.style.display = 'none';
    }
}

/**
 * Reload schema information after schema change
 */
async function reloadSchemaInfo() {
    try {
        const response = await fetch('/api/schema-info');
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to reload schema info');
        }
        
        schemaInfo = result.data;
        populateMessageSelector();
        await updateCurrentSchemaInfo();
        
        // Clear form
        if (editor) {
            editor.setValue('');
        }
        currentMessage = null;
        
    } catch (error) {
        console.error('Error reloading schema info:', error);
        throw error;
    }
}

/**
 * Update current schema information display
 */
async function updateCurrentSchemaInfo(errorMessage = null) {
    const currentSchemaText = document.getElementById('currentSchemaText');
    
    if (errorMessage) {
        currentSchemaText.textContent = errorMessage;
        return;
    }
    
    try {
        const response = await fetch('/api/schema/current');
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to get schema info');
        }
        
        const schemaData = result.data;
        currentSchemaText.textContent = `${schemaData.title} v${schemaData.version} (${schemaData.messageCount} messages, ${schemaData.channelCount} channels)`;
        
    } catch (error) {
        console.error('Error getting current schema info:', error);
        currentSchemaText.textContent = 'Schema information unavailable';
    }
}

/**
 * Fill example URL in the schema URL input
 */
function fillExampleUrl(url) {
    document.getElementById('schemaUrl').value = url;
}

/**
 * Handle Enter key press in schema URL input
 */
function handleSchemaUrlKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        loadSchemaFromUrl();
    }
}

/**
 * Populate the message selector dropdown with available messages
 */
function populateMessageSelector() {
    const messageSelect = document.getElementById('messageSelect');
    messageSelect.innerHTML = '<option value="">Select a message type...</option>';
    
    if (schemaInfo && schemaInfo.messages) {
        Object.keys(schemaInfo.messages).forEach(messageKey => {
            const message = schemaInfo.messages[messageKey];
            const option = document.createElement('option');
            option.value = messageKey;
            option.textContent = `${messageKey} - ${message.title}`;
            messageSelect.appendChild(option);
        });
    }
    
    messageSelect.addEventListener('change', onMessageSelected);
}

/**
 * Handle message selection from dropdown
 */
async function onMessageSelected(event) {
    const messageKey = event.target.value;
    
    if (messageKey && schemaInfo && schemaInfo.messages[messageKey]) {
        try {
            // Get operation info for selected message
            const messageId = schemaInfo.messages[messageKey].messageId || messageKey;
            const response = await fetch(`/api/message/${messageKey}/operation`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to load message operation info');
            }
            
            currentMessage = {
                messageId: messageKey,
                ...result.data
            };
            
            showResult(`Selected message: ${messageKey}`, 'info');
            
        } catch (error) {
            console.error('Error loading message info:', error);
            showResult('Error loading message info: ' + error.message, 'error');
            currentMessage = null;
        }
    } else {
        currentMessage = null;
    }
}

/**
 * Get operation and channel information for a message from schema
 */
function getMessageOperationInfo(messageId) {
    if (schemaInfo && schemaInfo.messageOperations && schemaInfo.messageOperations[messageId]) {
        return schemaInfo.messageOperations[messageId];
    }
    
    // Fallback: use first available channel and default to 'subscribe'
    const defaultChannel = Object.keys(schemaInfo?.channels || {})[0];
    return {
        operation: 'subscribe',
        channel: defaultChannel || 'default-channel'
    };
}

/**
 * Validate message payload
 */
async function validateMessage() {
    if (!editor) {
        showResult('Editor not initialized. Please refresh the page.', 'error');
        return;
    }
    
    const messageSelect = document.getElementById('messageSelect');
    const validateBtn = document.getElementById('validateBtn');
    const validateBtnText = document.getElementById('validateBtnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    try {
        if (!messageSelect.value) {
            showResult('Please select a message type first', 'error');
            return;
        }
        
        const messagePayload = editor.getValue().trim();
        if (!messagePayload) {
            showResult('Please enter a message payload', 'error');
            return;
        }
        
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(messagePayload);
        } catch (parseError) {
            showResult('Invalid JSON format: ' + parseError.message, 'error');
            return;
        }
        
        // Show loading state
        validateBtn.disabled = true;
        validateBtnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-flex';
        
        const response = await fetch('/api/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageId: currentMessage.messageId,
                payload: parsedPayload,
                channel: currentMessage.channel,
                operation: currentMessage.operation
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.valid) {
            showResult('Message payload is valid! All fields comply with the AsyncAPI schema.', 'success');
        } else {
            let errorMessage = 'Validation failed';
            
            // Check if we have detailed validation errors
            if (result.details && result.details.errors && Array.isArray(result.details.errors)) {
                showResult(errorMessage, 'error', result.details.errors);
            } else if (result.message) {
                // If we don't have structured errors but have a message, try to parse it
                const errors = result.message.split(', ').map(msg => {
                    const pathMatch = msg.match(/^data([^\s]+)/);
                    return {
                        instancePath: pathMatch ? pathMatch[1] : '/',
                        message: msg.replace(/^data[^\s]+ /, '')
                    };
                });
                showResult(errorMessage, 'error', errors);
            } else {
                showResult(errorMessage, 'error');
            }
        }
        
    } catch (error) {
        console.error('Validation error:', error);
        showResult('Validation error: ' + error.message, 'error');
    } finally {
        // Reset loading state
        validateBtn.disabled = false;
        validateBtnText.style.display = 'inline-flex';
        loadingSpinner.style.display = 'none';
    }
}

/**
 * Clear the form
 */
function clearForm() {
    if (editor) {
        editor.setValue('');
    }
    showResult('Form cleared', 'info');
}

/**
 * Format JSON in editor
 */
function formatJson() {
    if (!editor) return;
    
    try {
        const value = editor.getValue();
        if (!value) return;
        
        const parsed = JSON.parse(value);
        editor.setValue(JSON.stringify(parsed, null, 2));
        showResult('JSON formatted successfully', 'info');
    } catch (error) {
        showResult('Invalid JSON format: ' + error.message, 'error');
    }
}

/**
 * Show validation result message
 */
function showResult(message, type, errors = null) {
    const resultDiv = document.getElementById('validationResult');
    const iconName = getResultIconName(type);
    
    let bgColorClass = '';
    let textColorClass = '';
    let borderColorClass = '';
    
    switch (type) {
        case 'success':
            bgColorClass = 'bg-green-50 dark:bg-green-900';
            textColorClass = 'text-green-800 dark:text-green-200';
            borderColorClass = 'border-green-200 dark:border-green-800';
            break;
        case 'error':
            bgColorClass = 'bg-red-50 dark:bg-red-900';
            textColorClass = 'text-red-800 dark:text-red-200';
            borderColorClass = 'border-red-200 dark:border-red-800';
            break;
        case 'info':
            bgColorClass = 'bg-blue-50 dark:bg-blue-900';
            textColorClass = 'text-blue-800 dark:text-blue-200';
            borderColorClass = 'border-blue-200 dark:border-blue-800';
            break;
        case 'warning':
            bgColorClass = 'bg-yellow-50 dark:bg-yellow-900';
            textColorClass = 'text-yellow-800 dark:text-yellow-200';
            borderColorClass = 'border-yellow-200 dark:border-yellow-800';
            break;
    }
    
    let html = `
        <div class="flex items-start ${bgColorClass} p-4 rounded-md border ${borderColorClass}">
            <div class="flex-shrink-0">
                <i class="${iconName} ${textColorClass} text-lg"></i>
            </div>
            <div class="ml-3 w-full">
                <p class="text-sm font-medium ${textColorClass}">${message}</p>
    `;
    
    if (errors && errors.length > 0) {
        // Group errors by instancePath
        const groupedErrors = {};
        errors.forEach(error => {
            const path = error.instancePath || '(root)';
            if (!groupedErrors[path]) {
                groupedErrors[path] = [];
            }
            groupedErrors[path].push(error);
        });
        
        html += `<div class="mt-2 space-y-2">`;
        
        // Display grouped errors
        Object.entries(groupedErrors).forEach(([path, pathErrors]) => {
            html += `
                <div class="text-sm ${textColorClass} bg-opacity-50 rounded">
                    <p class="font-medium mb-1">${path === '(root)' ? 'General Errors' : `Path: ${path}`}</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
            `;
            
            pathErrors.forEach(error => {
                let errorMessage = error.message;
                
                // Special handling for enum errors
                if (error.keyword === 'enum' && error.params && error.params.allowedValues) {
                    errorMessage += `. Allowed values: [${error.params.allowedValues.join(', ')}]`;
                }
                
                html += `<li class="text-sm">${errorMessage}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');
    
    // Scroll to validation result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Get icon name for result type
 */
function getResultIconName(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'info':
        default:
            return 'info-circle';
    }
} 