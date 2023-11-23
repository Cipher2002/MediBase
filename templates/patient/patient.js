const storedPatientName = localStorage.getItem('patientName');
const storedPatientId = localStorage.getItem('patientId');

const storedReport = JSON.parse(localStorage.getItem('selectedReport'));
console.log(storedReport);

document.addEventListener('DOMContentLoaded', function () {
    // Retrieve data from localStorage
    const selectedReport = JSON.parse(localStorage.getItem('selectedReport'));

    // Check if there is data in localStorage
    if (selectedReport) {
        // Populate input and textarea elements with retrieved data
        document.getElementById('pid').value = storedPatientId;
        document.getElementById('date').value = selectedReport.date + ' ' + selectedReport.month + ' ' + selectedReport.year + ' | Time: ' + selectedReport.time;
        document.getElementById('pname').value = storedPatientName;
        document.getElementById('rep').value = selectedReport.rep;
        if (selectedReport.file == '') {
            document.getElementById('upselect').innerHTML = 'No file uploaded';
        } else {
            document.getElementById('uploadedImage').style.display = 'flex';
            document.getElementById('uploadedImage').src = selectedReport.file;
        }
        document.getElementById('rint').value = selectedReport.rint;
        document.getElementById('uint').value = selectedReport.uint;
    }
});