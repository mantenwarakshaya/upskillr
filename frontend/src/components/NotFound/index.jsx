import { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

// Wrapper to use navigate in class component
function withNavigation(ComponentClass) {
  return function(props) {
    const navigate = useNavigate();
    return <ComponentClass {...props} navigate={navigate} />;
  };
}

class NotFound extends Component {
  goBackHome = () => {
    this.props.navigate('/'); 
  }

  render() {
    return (
      <div className="not-found-container">
        <button onClick={this.goBackHome}>Go back to Home</button>
      </div>
    )
  }
}

export default withNavigation(NotFound);