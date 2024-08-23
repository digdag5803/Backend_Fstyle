$(document).ready(function() {
  $('#example').DataTable({
      "aLengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]],
      "iDisplayLength": 5,
      "searching": true,  // Cho phép tìm kiếm
      "columnDefs": [
          { "searchable": true, "targets": 2 }  // Tìm kiếm được cho cột thứ 2 (chỉ số cột là 1)
      ]
  });
});


function checkAll(bx) {
  var cbs = document.getElementsByTagName('input');
  for(var i=0; i < cbs.length; i++) {
    if(cbs[i].type == 'checkbox') {
      cbs[i].checked = bx.checked;
    }
  }
}
// script.js
function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
  return date.toLocaleString('en-US', options);
}
