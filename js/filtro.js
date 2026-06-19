const dropdown = document.querySelector(".category-dropdown");
const button = document.querySelector(".category-button");
const menuItems = document.querySelectorAll(".category-menu li");
const buttonText = document.querySelector(".category-left span");

button.addEventListener("click", () => {
    dropdown.classList.toggle("active");
});

const dropdownQueryMap = {
    presos: 'preso',
    leis: 'lei',
    impactos: 'impacto',
    golpes: 'golpe'
};

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        buttonText.textContent = item.textContent;
        dropdown.classList.remove("active");

        const query = dropdownQueryMap[item.dataset.value] ?? '';
        if (typeof renderNewsFeed === 'function') {
            renderNewsFeed({ query });
        }
    });
});

document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("active");
    }
});
