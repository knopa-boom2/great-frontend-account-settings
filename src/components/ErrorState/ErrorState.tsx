import errorIcon from '../../img/error-icon.svg';

import './styles/ErrorState.css';

export const ErrorState = () => {
  return (
    <div className='container'>
      <div className='error-state'>
        <div className='error-icon-container'>
          <img src={errorIcon} alt='error' />
        </div>
        <div className='error-description-container'>
          <span>Unexpected error</span>
          <p>
            We're facing some issues at the moment. Please try again later or
            contact support at
            <a href='support@codepulse.com'>support@codepulse.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};
