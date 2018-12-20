if (typeof jQuery !== "undefined" && typeof saveAs !== "undefined") {
    (function($) {
        $.fn.fileExport = function(ops) {
            var fileName = ops.fileName ? ops.fileName : ("Jquery-File-Export-" + new Date().getTime());
            var fileContent = '';
            if(ops.area == 'text'){
            	fileContent = $(this).text();
            } else {
            	fileContent = $(this).html();
            }
            // Create a Blob with the file contents
            var blob = new Blob([fileContent], {
                type: ops.type ? ops.type : "text/plain;charset=utf-8"
            });
            saveAs(blob, fileName + (ops.suffix || ''));
        };
    })(jQuery);
} else {
    if (typeof jQuery === "undefined") {
        console.error("jQuery Word Export: missing dependency (jQuery)");
    }
    if (typeof saveAs === "undefined") {
        console.error("jQuery Word Export: missing dependency (FileSaver.js)");
    }
}
