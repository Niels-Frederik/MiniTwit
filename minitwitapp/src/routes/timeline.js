import './layout.css';
import Message from '../components/message'

const mockJSON1 = {
    "messages":[
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/norton",
        "username":"norton",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/hampus",
        "username":"hampus",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/emil",
        "username":"emil",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    ]
}

const mockJSON2 = {
    "messages":[
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/norton",
        "username":"norton",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/yarl",
        "username":"yarl",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    {
        "img_src":"http://www.gravatar.com/avatar/4a539d5e489c4f378d0e642d640f9a59?d=identicon&amp;s=48",
        "user_href":"/niller",
        "username":"niller",
        "text":"Hello World!",
        "timestamp":"— 2021-02-01 @ 07:57"
    },
    ]
}

function getMessages(loggedIn){
    let _messages;
    if(loggedIn){
        _messages = mockJSON1;
    }
    else{
        _messages = mockJSON2;
    }
    return (
        <ul className="messages">
            {_messages.messages.map(message => (
            <Message {...message } />
          ))}
        </ul>
      );

}

function Timeline({ loggedIn }) {
    return (
        <>
            {getMessages(loggedIn)}
        </>
    )
}

export default Timeline;
