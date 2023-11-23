import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, collection, getDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js";
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

const monthNames = [
    "Jan", "Feb", "March", "April",
    "May", "June", "July", "Aug",
    "Sep", "Oct", "Nov", "Dec"
  ];

const currentDate = new Date();
const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();
const seconds = currentDate.getSeconds();

const date = currentDate.getDate();
var month = currentDate.getMonth();
const year = currentDate.getFullYear();

const storedDoctorName = localStorage.getItem('doctorName');
console.log(storedDoctorName);

document.getElementById('pid').addEventListener('input', async (e) => {
    const enteredPatientId = e.target.value;
    
    try {
        const patientCollection = collection(firestoreDb, enteredPatientId);
        const retrievelQuery = query(patientCollection, where('patientID', '==', enteredPatientId));
        const patientSnapshot = await getDocs(retrievelQuery);
        if (!patientSnapshot.empty) {
            const firstPatient = patientSnapshot.docs[0].data();
            document.getElementById('pname').value = firstPatient.name;
        } else {
            document.getElementById('pname').value = 'No Patient Found';
        }
    } catch (error) {
        document.getElementById('pname').value = 'No Patient Found';
    }
});

document.getElementById('sub').addEventListener('click', function(e) {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Get the form data
    var formData = new FormData(document.getElementById('mediform'));

    // Send a POST request to the Flask endpoint
    fetch('http://127.0.0.1:5000/report-submit', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Check if nlp_prediction is defined
        if (data.nlp_prediction !== undefined) {
            // Display the NLP prediction in the 'rint' textarea
            document.getElementById('rint').value = data.nlp_prediction;
        } else {
            // Display a message indicating no NLP prediction was made
            document.getElementById('rint').value = 'No Symptoms were given';
        }

        // Check if top_cnn_prediction is defined
        if (data.top_cnn_prediction !== undefined) {
            // Display the top CNN prediction in the 'uint' textarea
            document.getElementById('uint').value = data.top_cnn_prediction;
        } else {
            // Display a message indicating no top CNN prediction was made
            document.getElementById('uint').value = 'No Upload was made';
        }
    })
    .catch(error => console.error('Error:', error));
});

const patientId = document.getElementById('pid');

document.getElementById('save').addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        const collectionPath = `${patientId.value}`;
        const documentId = `${storedDoctorName}report${year}-${month}-${date}`;
        const usersCollection = collection(firestoreDb, collectionPath);
        const userDocRef = doc(usersCollection, documentId);

        console.log(usersCollection);
        const userSnapshot = await getDoc(userDocRef);

        // Assuming 'upfile' is an input element of type 'file'
        const fileInput = document.getElementById('upfile');
        const file = fileInput.files[0];

        // Check if a file is selected
        if (file) {
            try {
                // Upload the file to Firebase Storage
                const storageRef = ref(storage, 'user_images/' + file.name);
                const uploadTask = uploadBytesResumable(storageRef, file);
        
                // Wait for the upload to complete
                await uploadTask;
        
                // Get the download URL
                const downloadURL = await getDownloadURL(storageRef);
        
                if (userSnapshot.exists()) {
                    const databaseDoctorName = userSnapshot.data().doctorName;
                
                    if (storedDoctorName === databaseDoctorName) {
                        // Document exists and the doctorName matches, update its values including the file download URL
                        const updateData = {
                            doctorName: storedDoctorName,
                            date: date,
                            month: monthNames[month],
                            year: year,
                            time: `${hours}:${minutes}:${seconds}`,
                            rint: document.getElementById('rint').value,
                            uint: document.getElementById('uint').value,
                            rep: document.getElementById('rep').value,
                            file: downloadURL,
                        };
                
                        // Check if any input field had a value before and its value is empty now
                        Object.keys(updateData).forEach((key) => {
                            const inputValue = document.getElementById(key)?.value;
                            const databaseValue = userSnapshot.data()[key];
                
                            if (inputValue === '' && databaseValue !== undefined) {
                                delete updateData[key];
                            }
                        });
                
                        await updateDoc(userDocRef, updateData);
                        document.getElementById('mediform').reset();
                        console.log('Document updated successfully!');
                    } else {
                        // DoctorName doesn't match, create a new document including the file download URL
                        const newData = {
                            doctorName: storedDoctorName,
                            date: date,
                            month: monthNames[month],
                            year: year,
                            time: `${hours}:${minutes}:${seconds}`,
                            rint: document.getElementById('rint').value,
                            uint: document.getElementById('uint').value,
                            rep: document.getElementById('rep').value,
                            file: downloadURL,
                        };
                
                        await setDoc(userDocRef, newData);
                        document.getElementById('mediform').reset();
                        console.log('New document created successfully!');
                    }
                } else {
                    // Document doesn't exist, create a new one including the file download URL
                    const newData = {
                        doctorName: storedDoctorName,
                        date: date,
                        month: monthNames[month],
                        year: year,
                        time: `${hours}:${minutes}:${seconds}`,
                        rint: document.getElementById('rint').value,
                        uint: document.getElementById('uint').value,
                        rep: document.getElementById('rep').value,
                        file: downloadURL,
                    };
                
                    await setDoc(userDocRef, newData);
                    document.getElementById('mediform').reset();
                    console.log('New document created successfully!');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            try {
                if (userSnapshot.exists()) {
                    const databaseDoctorName = userSnapshot.data().doctorName;
                
                    if (storedDoctorName === databaseDoctorName) {
                        // Document exists and the doctorName matches, update its values including the file download URL
                        const updateData = {
                            doctorName: storedDoctorName,
                            date: date,
                            month: monthNames[month],
                            year: year,
                            time: `${hours}:${minutes}:${seconds}`,
                            rint: document.getElementById('rint').value,
                            uint: document.getElementById('uint').value,
                            rep: document.getElementById('rep').value,
                            file: '',
                        };
                
                        // Check if any input field had a value before and its value is empty now
                        Object.keys(updateData).forEach((key) => {
                            const inputValue = document.getElementById(key)?.value;
                            const databaseValue = userSnapshot.data()[key];
                
                            if (inputValue === '' && databaseValue !== undefined) {
                                delete updateData[key];
                            }
                        });
                
                        await updateDoc(userDocRef, updateData);
                        document.getElementById('mediform').reset();
                        console.log('Document updated successfully!');
                    } else {
                        // DoctorName doesn't match, create a new document including the file download URL
                        const newData = {
                            doctorName: storedDoctorName,
                            date: date,
                            month: monthNames[month],
                            year: year,
                            time: `${hours}:${minutes}:${seconds}`,
                            rint: document.getElementById('rint').value,
                            uint: document.getElementById('uint').value,
                            rep: document.getElementById('rep').value,
                            file: '',
                        };
                
                        await setDoc(userDocRef, newData);
                        document.getElementById('mediform').reset();
                        console.log('New document created successfully!');
                    }
                } else {
                    // Document doesn't exist, create a new one including the file download URL
                    const newData = {
                        doctorName: storedDoctorName,
                        date: date,
                        month: monthNames[month],
                        year: year,
                        time: `${hours}:${minutes}:${seconds}`,
                        rint: document.getElementById('rint').value,
                        uint: document.getElementById('uint').value,
                        rep: document.getElementById('rep').value,
                        file: '',
                    };
                
                    await setDoc(userDocRef, newData);
                    document.getElementById('mediform').reset();
                    console.log('New document created successfully!');
                }
            } catch (error) {
                console.error('Error updating document:', error);
            }
        }
        
    } catch (error) {
        console.error('Error getting document:', error);
    }
});