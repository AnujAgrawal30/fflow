const LiteGraph = require('../../../common/lib/litegraph');

//Creates an interface to access extra features from a graph (like play, stop, live, etc)
function Editor(container_id, options) {
    options = options || {};

    //fill container
    let html = "<div class='header'><div class='tools tools-left'></div><div class='tools tools-right'></div></div>";
    html += "<div class='content'><div class='editor-area'><canvas class='graphcanvas' width='1000' height='500' tabindex=10></canvas></div></div>";

    const root = document.createElement("div");
    this.root = root;
    root.className = "litegraph litegraph-editor";
    root.innerHTML = html;

    this.content = root.querySelector(".content");

    let canvas = root.querySelector(".graphcanvas");

    //create graph
    const graph = (this.graph = new LiteGraph.LGraph());
    const graphcanvas = (this.graphcanvas = new LiteGraph.LGraphCanvas(canvas, graph));
    graphcanvas.background_image = "/app/grid.36956d56.png";

    graph.onAfterExecute = function() {
        graphcanvas.draw(true);
    };

    this.addToolsButton(
        "save_button",
        "Save",
        "lni-save",
        options.onSave.bind(this),
        ".tools-right"
    );


    //append to DOM
    const parent = document.getElementById(container_id);

    if (parent) {
        parent.appendChild(root);
    }

    graphcanvas.resize();
}

Editor.prototype.addToolsButton = function( id, name, iconClass, callback, container ) {
    if (!container) {
        container = ".tools";
    }

    const button = this.createButton(name, iconClass, callback);
    button.id = id;
    this.root.querySelector(container).appendChild(button);
};

Editor.prototype.createButton = function(name, iconClass, callback) {
    const button = document.createElement("button");
    if (iconClass) {
        button.innerHTML = "<i class=\"lni " + iconClass + "\"></i> ";
    }
    button.classList.add("btn");
    button.innerHTML += name;
    if(callback)
        button.addEventListener("click", callback );
    return button;
};

module.exports = Editor;