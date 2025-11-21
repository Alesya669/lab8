const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const feedbackModal = document.getElementById('feedbackModal');
const feedbackForm = document.getElementById('feedbackForm');
const responseMessage = document.getElementById('responseMessage');

const STORAGE_KEY = 'feedbackFormData';

// Валидация ФИО (только буквы, пробелы и дефисы)
function validateFullName(name) {
    return /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(name);
}

// Валидация телефона (только цифры, пробелы и плюс)
function validatePhone(phone) {
    return /^[\d\s\+]+$/.test(phone);
}

// Открытие модального окна
openModalBtn.addEventListener('click', function() {
    feedbackModal.style.display = 'flex';
    // Изменение URL с помощью History API
    history.pushState({ modalOpen: true }, '', '#feedback');
    // Восстановление данных из LocalStorage
    restoreFormData();
});

// Закрытие модального окна
closeModalBtn.addEventListener('click', closeModal);

// Закрытие модального окна при клике вне его области
feedbackModal.addEventListener('click', function(e) {
    if (e.target === feedbackModal) {
        closeModal();
    }
});

// Обработка нажатия кнопки "Назад" в браузере
window.addEventListener('popstate', function(e) {
    if (location.hash !== '#feedback') {
        closeModal();
    }
});

// Функция закрытия модального окна
function closeModal() {
    feedbackModal.style.display = 'none';
    // Возврат к исходному URL
    if (location.hash === '#feedback') {
        history.back();
    }
}

// Сохранение данных формы в LocalStorage
function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('message').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

// Восстановление данных формы из LocalStorage
function restoreFormData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('fullName').value = formData.fullName || '';
        document.getElementById('email').value = formData.email || '';
        document.getElementById('phone').value = formData.phone || '';
        document.getElementById('organization').value = formData.organization || '';
        document.getElementById('message').value = formData.message || '';
    }
}

// Очистка данных формы в LocalStorage
function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
}

// Валидация формы перед отправкой
function validateForm() {
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;

    let isValid = true;

    // Валидация ФИО
    if (fullName && !validateFullName(fullName)) {
        showFieldError('fullName', 'ФИО может содержать только буквы, пробелы и дефисы');
        isValid = false;
    } else {
        clearFieldError('fullName');
    }

    // Валидация телефона
    if (phone && !validatePhone(phone)) {
        showFieldError('phone', 'Телефон может содержать только цифры, пробелы, +');
        isValid = false;
    } else {
        clearFieldError('phone');
    }

    return isValid;
}

// Показать ошибку для конкретного поля
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');

    // Удаляем старую ошибку если есть
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Добавляем новую ошибку
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;

    formGroup.appendChild(errorElement);
    field.style.borderColor = '#dc3545';
}

// Очистить ошибку поля
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.field-error');

    if (existingError) {
        existingError.remove();
    }

    field.style.borderColor = '#C2C5CE';
}

// Обработка отправки формы
feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Проверяем валидацию перед отправкой
    if (!validateForm()) {
        showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }

    // Сбор данных формы
    const formData = new FormData(feedbackForm);

    // Используем Formspree вместо Formcarry
    fetch('https://formcarry.com/s/dBg2a470fh0', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            showMessage('Сообщение успешно отправлено!', 'success');
            feedbackForm.reset();
            clearFormData();
        } else {
            return response.json().then(err => {
                throw new Error(err.error || 'Ошибка отправки формы');
            });
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', 'error');
    });
});

// Функция отображения сообщения
function showMessage(text, type) {
    responseMessage.textContent = text;
    responseMessage.className = 'message ' + type;
    responseMessage.style.display = 'block';

    // Автоматическое скрытие сообщения через 5 секунд
    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
}

// Обработчики для реальной валидации при вводе
document.getElementById('fullName').addEventListener('input', function(e) {
    if (this.value && !validateFullName(this.value)) {
        showFieldError('fullName', 'ФИО может содержать только буквы, пробелы ');
    } else {
        clearFieldError('fullName');
    }
    saveFormData();
});

document.getElementById('phone').addEventListener('input', function(e) {
    if (this.value && !validatePhone(this.value)) {
        showFieldError('phone', 'Телефон может содержать только цифры, пробелы, +');
    } else {
        clearFieldError('phone');
    }
    saveFormData();
});

// Сохранение данных формы при изменении полей
const otherInputs = feedbackForm.querySelectorAll('#email, #organization, #message');
otherInputs.forEach(input => {
    input.addEventListener('input', saveFormData);
});