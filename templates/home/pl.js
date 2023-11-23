import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getFirestore, collection, getDocs} from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOffW6-m1j1pGTODh8j1BSjml2l8FW8WQ",
  authDomain: "medibase-d421d.firebaseapp.com",
  databaseURL: "https://medibase-d421d-default-rtdb.firebaseio.com",
  projectId: "medibase-d421d",
  storageBucket: "medibase-d421d.appspot.com",
  messagingSenderId: "1013464166789",
  appId: "1:1013464166789:web:f494da3d2b9a76c59f94ec",
  measurementId: "G-3B9R034V2Q"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

// Retrieve values from local storage
const storedPatientName = localStorage.getItem('patientName');
const storedPatientId = localStorage.getItem('patientId');
const storedNodeWithDetails = localStorage.getItem('nodeWithDetails');

document.getElementById('welcome-message').innerHTML = `Welcome ${storedPatientName}!`;

let contentCleared = false;

async function getPatientReports() {
    const patientReportsCollection = collection(firestoreDb, storedPatientId);
    const patientReportsSnapshot = await getDocs(patientReportsCollection);

    // Convert the snapshot to an array of reports
    const patientReports = patientReportsSnapshot.docs.map(doc => doc.data());
    return patientReports;
}

function updatePatientReportsList(patientReports) {
    const mainContent = document.getElementById('content');
    const ulElement = mainContent.querySelector('ul');

    // Check if content has been cleared
    if (!contentCleared) {
        // Clear existing content
        ulElement.innerHTML = '';
        contentCleared = true;
    }

    // Iterate through each report starting from index 1
    for (let index = 0; index < patientReports.length; index++) {
        console.log(patientReports[index]);
        if (patientReports[index].name != undefined) {
        }
        else{
            const report = patientReports[index];
            const listItem = document.createElement('li');
            listItem.classList.add('card');
    
            const anchor = document.createElement('a');
            anchor.href = `../patient/patient.html`;
            anchor.addEventListener('click', function(event) {
                // Prevent the default behavior of the link
                event.preventDefault();
    
                // Store the report data in localStorage
                localStorage.setItem('selectedReport', JSON.stringify(report));
    
                // Navigate to the target page
                window.location.href = anchor.href;
            });
    
            const time = document.createElement('time');
            time.classList.add('time');
    
            const monthDiv = document.createElement('div');
            monthDiv.classList.add(`month`, `month${index}`);
            monthDiv.textContent = report.month;
    
            const dateDiv = document.createElement('div');
            dateDiv.classList.add(`date`, `date${index}`);
            dateDiv.textContent = report.date;
    
            time.appendChild(monthDiv);
            time.appendChild(dateDiv);
    
            const docname = document.createElement('h2');
            docname.classList.add('docname');
            docname.textContent = 'Dr. '+report.doctorName;
    
            const meta = document.createElement('div');
            meta.classList.add('meta');
            meta.textContent = report.rep;
            if (report.file != '' && report.rep != '') {
                const lineBreak = document.createElement('br');
                meta.appendChild(lineBreak);
            
                const textNode = document.createTextNode('Uploaded Scans Available');
                meta.appendChild(textNode);
            }
            else if (report.file != '') {
                meta.textContent = 'Uploaded Scans Available';
            }
            anchor.appendChild(time);
            anchor.appendChild(docname);
            anchor.appendChild(meta);
            listItem.appendChild(anchor);
            ulElement.appendChild(listItem);   
        }
    }
}

// Usage: Fetch patient details and reports, then update the HTML content
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const patientReports = await getPatientReports();
        updatePatientReportsList(patientReports);
    } catch (error) {
        console.error('Error fetching patient details or reports:', error);
    }
});
