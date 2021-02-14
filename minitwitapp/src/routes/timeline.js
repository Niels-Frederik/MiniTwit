import './layout.css';
import Message from '../components/message'
import {fetchData} from '../utils/fetchData'
import {getData} from '../utils/fetchData'
import {postData} from'../utils/fetchData'
import axios from "axios"
import reportWebVitals from '../reportWebVitals';

async function getMessages(publicTimeline){
    let _messages = [];
    let url = "";
    if(publicTimeline) url = "http://localhost:5000/public_timeline";
    else url = "http://localhost:5000/timeline";

    await axios.get(url).then((response) =>
    {
        //_messages.push(response);
        console.log(response);
        console.log(_messages);
    })

    return (
        <ul className="messages">
            {_messages.data.map(message => (
            <Message {...message } />
          ))}
        </ul>
      );

}

async function Timeline({ loggedIn }) {
    return (
        <>
            {await getMessages(loggedIn)}
        </>
    )
}

export default Timeline;
