import './layout.css';

// Todo : implement submit functionality

function Register() {
  return (
    <>
        <h2>Sign In</h2>
        <form>
            <label>
                Username:
                <input type="text" name="username" size="30" />
            </label>
            <label>
                Email:
                <input type="text" name="email" size="30" />
            </label>
            <label>
                Password:
                <input type="password" name="password" size="30" />
            </label>
            <label>
                Password (repeat):
                <input type="password" name="password2" size="30" />
            </label>
            <div className="actions">
                <input type="submit" value="Sign Up"/>
            </div>
        </form>
    </>
  );
}

export default Register;
