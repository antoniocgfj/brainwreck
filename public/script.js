var images = ["picture (1)", "picture (2)", "picture (3)", "picture (4)", "picture (5)", "picture (6)", "picture (7)",];
var i = 70;

document.getElementById("prev").addEventListener("click", function() {
    i--;
    console.log(i);
    document.getElementById("picture").innerHTML = "<a href='static/" + images[i % 7] + ".jpg' download><img src='static/" + images[i % 7] + ".jpg'></a>"
});

document.getElementById("next").addEventListener("click", function() {
    i++;
    document.getElementById("picture").innerHTML = "<a href='static/" + images[i % 7] + ".jpg' download><img src='static/" + images[i % 7] + ".jpg'></a>"
});