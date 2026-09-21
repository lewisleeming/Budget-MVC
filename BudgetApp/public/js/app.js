'use strict';

// Toggle custom category input
function handleCategoryChange(selectElement) {
    const customGroup = document.getElementById('custom-category-group');
    const customInput = document.getElementById('custom-category');
    if (!customGroup || !customInput) return;

    if (selectElement.value === 'Other' || selectElement.value === 'others') {
        customGroup.style.display = 'block';
        customInput.required = true;
        customInput.name = 'category';
        selectElement.name = '';
    } else {
        customGroup.style.display = 'none';
        customInput.required = false;
        customInput.name = '';
        selectElement.name = 'category';
    }
}

// Toggle recurring frequency select
function toggleRecurringOptions(checkbox) {
    const frequencyGroup = document.getElementById('frequency-group');
    if (frequencyGroup) {
        frequencyGroup.style.display = checkbox.checked ? 'block' : 'none';
    }
}

// Budget Modal
function toggleBudgetModal(show) {
    const modal = document.getElementById('budget-modal');
    if (!modal) return;
    if (show) {
        if (typeof modal.showModal === 'function') {
            modal.showModal();
        } else {
            modal.setAttribute('open', 'true');
        }
    } else {
        if (typeof modal.close === 'function') {
            modal.close();
        } else {
            modal.removeAttribute('open');
        }
    }
}

// Delete Confirmation Modal
function openDeleteDialog(type, id, description, amount) {
    const dialog = document.getElementById('delete-dialog');
    const form = document.getElementById('delete-form');
    const descEl = document.getElementById('delete-item-desc');
    const amountEl = document.getElementById('delete-item-amount');

    if (!dialog || !form) return;

    form.action = `/${type}/${id}/delete`;
    if (descEl) descEl.textContent = description;
    if (amountEl) amountEl.textContent = ` (${amount})`;

    if (typeof dialog.showModal === 'function') {
        dialog.showModal();
    } else {
        dialog.setAttribute('open', 'true');
    }
}

function closeDeleteDialog() {
    const dialog = document.getElementById('delete-dialog');
    if (dialog) {
        if (typeof dialog.close === 'function') {
            dialog.close();
        } else {
            dialog.removeAttribute('open');
        }
    }
}

// Close dialogs when clicking on the backdrop
document.addEventListener('DOMContentLoaded', () => {
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach((dialog) => {
        dialog.addEventListener('click', (event) => {
            const rect = dialog.getBoundingClientRect();
            const isInDialog =
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width;
            if (!isInDialog) {
                if (typeof dialog.close === 'function') {
                    dialog.close();
                } else {
                    dialog.removeAttribute('open');
                }
            }
        });
    });
});
