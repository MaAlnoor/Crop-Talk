document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.querySelector(".btn");

    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            alert("Form submitted!");
        });
    }
});
