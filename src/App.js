import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Input from '@material-ui/core/Input';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAl67Mo1BUxRnKzqvvltwCb4HjBcprm-L8",
  authDomain: "chatterbot-da261.firebaseapp.com",
  databaseURL: "https://chatterbot-da261.firebaseio.com",
  projectId: "chatterbot-da261",
  storageBucket: "chatterbot-da261.appspot.com",
  messagingSenderId: "129791108235",
  appId: "1:129791108235:web:0b320c23ea5e38318ee08e"
});

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <Container className="App">
      <header>
        <SignOut />
      </header>

      <section className="chat_room">
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </Container>
  );
}

function SignIn() {

  const [formValue, setFormValue] = useState('');


  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  const signUpWithUserAndPassword = (email, password) => {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });      
  }

  const signInWithUserAndPassword = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
    
  }

  return (
    <>
      <Button variant="contained" color="primary" id="sign-in" onClick={signInWithGoogle}>Sign in with Google</Button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <Button variant="contained" color="primary" id="sign-out" onClick={() => auth.signOut()}>Sign Out</Button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <Button variant="contained" color="primary" type="submit">Submit</Button>
    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <Avatar id="avatar-image" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
