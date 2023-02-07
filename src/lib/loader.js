var init_loader = function init_loader() {	
	itgapp.server.append("<style type='text/css'>.loader {border: 1em solid #f3f3f3;border-top: 1em solid #3498db;border-radius: 50%;width: 50px;margin: 0 auto !important;height: 50px;vertical-align: middle;display: block;animation: spin 1s linear infinite;};@-webkit-keyframes spin {0% {-webkit-transform: rotate(0deg);}100% {-webkit-transform: rotate(360deg);}}@keyframes spin {0% {transform: rotate(0deg);}100% {transform: rotate(360deg);}}</style>");
	itgapp.server.append(jQueryITG.parseHTML("<div class='loader_box' style='width: 100%;background-color: white;display: table-cell;display:block;position:absolute;z-index: 999;'><div class='loader' id='loader_itg'></div></div>"));
}
function loader(status,location) {	
	var a=document.getElementsByClassName("itg-page");
	if(status) {
		itgapp.loads=itgapp.loads+1;
		for (var i=0;i<a.length;i++) {
			a[i].style.opacity=0.2;
		}
		document.getElementById("loader_box").style.display = "block";		
		document.getElementById("loader_box").style['z-index'] = 999;	
	} else {
		itgapp.loads=itgapp.loads-1;
		if (itgapp.loads==0) {
			document.getElementById("loader_box").style.display = "none";
			document.getElementById("loader_box").style['z-index'] = 0;	
			for (var i=0;i<a.length;i++) {
				a[i].style.opacity=1;
			}
		}
	}
}