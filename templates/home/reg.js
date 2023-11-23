import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js";


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

$('.name').on("change keyup paste", function(){
    if($(this).val()){
      $('.icon-user').addClass("next");
    } else {
      $('.icon-user').removeClass("next");
    }
});

$('.next-button.name').click(function(){
    $('.name-section').addClass("fold-up");
    $('.email-section').removeClass("folded");
});

$('.email').on("change keyup paste", function(){
    if($(this).val()){
      $('.icon-paper-plane').addClass("next");
    } else {
      $('.icon-paper-plane').removeClass("next");
    }
});

$('.next-button.email').click(function(){
    $('.email-section').addClass("fold-up");
    $('.password-section').removeClass("folded");
});

$('.password').on("change keyup paste", function(){
    if($(this).val()){
      $('.icon-lock').addClass("next");
    } else {
      $('.icon-lock').removeClass("next");
    }
});

$('.next-button.password').click(function(){
    $('.password-section').addClass("fold-up");
    $('.repeat-password-section').removeClass("folded");
});

$('.repeat-password').on("change keyup paste", function(){
    if($(this).val()){
      $('.icon-repeat-lock').addClass("next");
    } else {
      $('.icon-repeat-lock').removeClass("next");
    }
});

$('.next-button.repeat-password').click(function(){
  var password = $('.password').val();
  var repeatPassword = $('.repeat-password').val();
  console.log(password, repeatPassword);
  if(password === repeatPassword){
    $('.repeat-password-section').addClass("fold-up");
    $('.phone-section').removeClass("folded");
  } else {
    alert("Passwords do not match.");
  }
});

$('.phone').on("change keyup paste", function(){
    if($(this).val()){
      $('.icon-phone').addClass("next");
    } else {
      $('.icon-phone').removeClass("next");
    }
});

$('.next-button.phone').click( async function(){
  const name = $('.name').val();
  const email = $('.email').val();
  const password = $('.password').val();
  const repeatPassword = $('.repeat-password').val();
  const phone = $('.phone').val();
  console.log(name, email, password, repeatPassword, phone);

  const data = {
    name: name,
    email: email,
    password: password,
    patientID: phone
  };
  
  try {
    const usersCollection = collection(firestoreDb, phone);
    const userSnapshot = await getDocs(usersCollection);

    let userExists = false;

    userSnapshot.forEach((doc) => {
        if (doc.data().patientID == phone) {
            userExists = true;
        }
    });

    if (userExists) {
        alert('User already exists. Please login.');
        // Redirect back to index.html
        window.location.href = 'index.html';
        return; // Add this line to stop the execution of the rest of the code
    } else {
        const addedDocRef = await addDoc(usersCollection, data);
        console.log("Document written with ID: ", addedDocRef.id);
    }
} catch (e) {
    console.error("Error adding document: ", e);
}

  $('.phone-section').addClass("fold-up");
  $('.success').css("marginTop", 0);
})