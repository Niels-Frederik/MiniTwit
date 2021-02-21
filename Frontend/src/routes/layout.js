import './layout.css';
import { Link, Redirect, Route, useHistory } from 'react-router-dom'
import Login from './login'
import Register from './register'
import Timeline from './timeline'
import React, { useState, useEffect } from 'react';
import axios from "axios";
import cookies from "js-cookie";
//import 

function Layout() {
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useState(false)

    //var loggedIn = isLoggedIn()

    useEffect(() => {
        setLoggedIn(isLoggedIn())
    // Update the document title using the browser API
    //document.title = `You clicked ${count} times`;
    //console.log("piklort")
    }, []);

    function getLayout()
    {
        //console.log(cookies.get("accessToken"))
        if (loggedIn)
        {
            return(
            <>
                <Link to="/timeline">My Timeline</Link>
                <Link to="/public_timeline">Public Timeline</Link>
                <Link 
                    to="/logout"
                    onClick={ async () => {
                        await axios({
                            method: 'get',
                            url: 'http://localhost:5000/logout',
                            credentials: 'include',
                            withCredentials: true
                        })
                        .then(() => {
                            alert('Logged out');
                            setLoggedIn(false);
                            history.push('/public_timeline');
                        }, () => {
                            alert('Failed to log out');
                        })
                    }}
                >
                    sign out 
                </Link>
            </>
            )
        }
        else{
            return(
                <>
                    <Link to="/public_timeline">Public Timeline</Link>
                    <Link to="/register">Sign Up</Link>
                    <Link to="/login">Sign In</Link>
                </>
            )
        }
    }

    return (
        <div className="page">
            <h1>MiniTwit</h1>
            <div className="navigation">
                {getLayout()}
            </div>
            <div className="body">
                <Route 
                    path="/public_timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={true} />
                    )}
                />
                
                <Route 
                    path="/timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={false} />
                    )}
                />
                <Route 
                    path="/login" 
                    render={(props) => (
                        <Login {...props} setLoggedIn = {setLoggedIn} />
                    )}
                />
                <Route path="/register" component={Register}/>
                
                <Route
                    path="/"
                        render={(props) => (
                            <Redirect to = "/public_timeline"/>
                    )}
                />
            </div>
            <div className="footer">
                MiniTwit &mdash; A shit application 
            </div>
        </div>
    );
}

function isLoggedIn()
{
    const cookie = cookies.get('accessToken')
    if (cookie != undefined && cookie.length > 0) return true
    else return false
}

export default Layout;
