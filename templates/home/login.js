import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-storage.js";

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
const storage = getStorage(firebaseApp);

const userForms = document.getElementById('user_options-forms');

document.getElementById('signup-button').addEventListener('click', () => {
  userForms.classList.remove('bounceRight')
  userForms.classList.add('bounceLeft')
}, false)

document.getElementById('login-button').addEventListener('click', () => {
  userForms.classList.remove('bounceLeft')
  userForms.classList.add('bounceRight')
}, false)

// document.addEventListener('DOMContentLoaded', () => {
//   const patientLoginForm = document.getElementById('patient-login-form');
//   const usernameInput = document.getElementById('ploginname');

//   patientLoginForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     // Get the entered username
//     const username = usernameInput.value;

//     // Redirect to the profile page with the username as a query parameter
//     window.location.href = `patientlogs.html?username=${encodeURIComponent(username)}`;
//   });
// });

document.getElementById("doctor_redirect").addEventListener("click", function(e) {
  e.preventDefault();
  localStorage.setItem('doctorName', document.getElementById('dname').value);
  window.location.href = "../doctor/doctor.html";
});

const patientName = document.getElementById('ploginname');
const patientPassword = document.getElementById('ploginpwd');
const patientId = document.getElementById('ploginid');

document.getElementById('patient_redirect').addEventListener('click', async function(e) {
  e.preventDefault();
  try{
    const usersCollection = collection(firestoreDb, patientId.value);
    const userSnapshot = await getDocs(usersCollection);
    let nodeId = null;
    userSnapshot.forEach((doc) => {
        if (doc.data().patientID == patientId.value) {
            nodeId = doc.id;
        }
    });
    console.log(nodeId);
    const updateRef = doc(firestoreDb, patientId.value, nodeId);
    const userDocSnapshot = await getDoc(updateRef);
    if (userDocSnapshot.exists()) {
      if (userDocSnapshot.data().patientID == patientId.value && 
          userDocSnapshot.data().password == patientPassword.value) {
        
        // Store values in local storage before redirecting
        localStorage.setItem('nodeWithDetails', nodeId);
        localStorage.setItem('patientName', patientName.value);
        localStorage.setItem('patientId', patientId.value);
        
        window.location.href = "./patientlogs.html";
      } else {
        alert("Invalid Credentials");
      }
    }
  }catch(error){alert("No User. Please Register.");}
});