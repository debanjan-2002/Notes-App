const title = document.querySelector("input");
const text = document.querySelector("textarea");
const button = document.querySelector(".update-btn");

const previousTitle = title.value;
const previousText = text.value;

text.addEventListener("input", e => {
    if (previousText !== e.target.value) {
        button.removeAttribute("disabled");
    } else if (title.value === previousTitle) {
        button.setAttribute("disabled", "");
    }
});

title.addEventListener("input", e => {
    if (previousTitle !== e.target.value) {
        button.removeAttribute("disabled");
    } else if (text.value === previousText) {
        button.setAttribute("disabled", "");
    }
});
