const grid = document.querySelector(".grid");

const masonary = new Masonry(grid, {
    itemSelector: ".card",
    columnWidth: 20,
    fitWidth: true,
    gutter: 5
});
