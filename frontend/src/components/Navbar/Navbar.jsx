import './Navbar.css'

function Navbar () {
    return (
        <nav>
            <div className="nav-item">
                <img src="" alt="logo" />
            </div>
            <div className="nav-item">
                <a href="">Home</a>
                <a href="">Projects</a>
                <a href="">Developers</a>
            </div>
            <div className="nav-item">
                <a href="" class="login">Login</a>
                <a href="" class="sign-up">Sign Up</a>
            </div>
        </nav>
    )
}

export default Navbar;