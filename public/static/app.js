document.addEventListener("DOMContentLoaded", function () {
    const moduleCountInput = document.querySelector('input[name="number_of_modules"]');
    const serialContainer = document.getElementById("panelSerialInputs");
    const serialCount = document.getElementById("serialCount");
    const serialError = document.getElementById("serialError");
    const form = document.querySelector("form");

    if (!moduleCountInput || !serialContainer) {
        return;
    }

    function getExistingSerials() {
        const value = window.existingPanelSerials || "";
        if (Array.isArray(value)) {
            return value.map(String);
        }

        return String(value)
            .split(/[\n,;]+/)
            .map(value => value.trim())
            .filter(Boolean);
    }

    function getCurrentSerials() {
        return Array.from(
            serialContainer.querySelectorAll('input[name="panel_serial_no"]')
        ).map(input => input.value.trim());
    }

    function showError(message) {
        serialError.textContent = message || "";
    }

    function createSerialField(index, value) {
        const wrapper = document.createElement("div");
        wrapper.className = "serial-input-row";

        const sequence = document.createElement("span");
        sequence.className = "serial-sequence";
        sequence.textContent = String(index + 1);
        sequence.setAttribute("aria-hidden", "true");

        const label = document.createElement("label");
        label.className = "serial-input-label";
        label.setAttribute("for", `panel_serial_no_${index + 1}`);
        label.textContent = `Panel Serial Number ${index + 1}`;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `panel_serial_no_${index + 1}`;
        input.name = "panel_serial_no";
        input.value = value || "";
        input.placeholder = `Enter serial number ${index + 1}`;
        input.autocomplete = "off";
        input.required = true;
        input.className = "panel-serial-input";

        input.addEventListener("input", function () {
            this.value = this.value.trimStart();
            showError("");
        });

        label.appendChild(input);
        wrapper.appendChild(sequence);
        wrapper.appendChild(label);

        return wrapper;
    }

    function renderSerialFields() {
        const rawCount = moduleCountInput.value.trim();
        const count = Number.parseInt(rawCount, 10);

        const previousValues = getCurrentSerials();
        const existingValues = getExistingSerials();
        const values = previousValues.length ? previousValues : existingValues;

        serialContainer.innerHTML = "";
        showError("");

        if (!rawCount || !Number.isInteger(count) || count < 1) {
            serialCount.textContent = "0 Panels";
            return;
        }

        if (count > 500) {
            serialCount.textContent = "Maximum 500";
            showError("Number of PV Modules cannot be more than 500.");
            return;
        }

        for (let i = 0; i < count; i++) {
            const value = values[i] || "";
            serialContainer.appendChild(createSerialField(i, value));
        }

        serialCount.textContent = `${count} Panel${count === 1 ? "" : "s"}`;
    }

    moduleCountInput.addEventListener("input", renderSerialFields);
    moduleCountInput.addEventListener("change", renderSerialFields);

    form.addEventListener("submit", function (event) {
        const count = Number.parseInt(moduleCountInput.value.trim(), 10);

        const serialInputs = Array.from(
            serialContainer.querySelectorAll('input[name="panel_serial_no"]')
        );

        if (!Number.isInteger(count) || count < 1 || count > 500) {
            event.preventDefault();
            showError("Please enter a valid number of PV Modules (1 to 500).");
            moduleCountInput.focus();
            return;
        }

        if (serialInputs.length !== count) {
            event.preventDefault();
            showError(
                "Panel serial-number fields could not be generated correctly. Please change the module count and try again."
            );
            return;
        }

        const emptyIndex = serialInputs.findIndex(
            input => !input.value.trim()
        );

        if (emptyIndex !== -1) {
            event.preventDefault();
            showError(
                `Please enter Panel Serial Number ${emptyIndex + 1}.`
            );
            serialInputs[emptyIndex].focus();
            return;
        }


        // ----------------------------------------
        // DUPLICATE SERIAL NUMBER CHECK
        // ----------------------------------------

        serialInputs.forEach(input => {
            input.value = input.value.trim();
        });

        const normalizedSerials = serialInputs.map(input =>
            input.value.toUpperCase()
        );

        const duplicateSerials = [];

        normalizedSerials.forEach((serial, index) => {
            if (
                normalizedSerials.indexOf(serial) !== index &&
                !duplicateSerials.includes(serial)
            ) {
                duplicateSerials.push(serial);
            }
        });

        if (duplicateSerials.length > 0) {
            event.preventDefault();

            showError(
                "Duplicate Panel Serial Number not allowed: " +
                duplicateSerials.join(", ")
            );

            serialInputs.forEach(input => {
                const value = input.value.toUpperCase();

                if (duplicateSerials.includes(value)) {
                    input.classList.add("serial-duplicate");
                } else {
                    input.classList.remove("serial-duplicate");
                }
            });

            const firstDuplicate = serialInputs.find(input =>
                duplicateSerials.includes(
                    input.value.toUpperCase()
                )
            );

            if (firstDuplicate) {
                firstDuplicate.focus();
            }

            return;
        }
    });

    renderSerialFields();
});
