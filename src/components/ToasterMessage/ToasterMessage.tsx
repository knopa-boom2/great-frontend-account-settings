import './styles/ToasterMessage.css';

interface ToasterMessageProps {
  data: {
    title: string;
    text: string;
    isSuccess: boolean;
  };
}

export const ToasterMessage = (props: ToasterMessageProps) => {
  return (
    <div
      className={`msg-container ${props.data.isSuccess ? 'success' : 'error'}`}
    >
      <p className='msg-title'>{props.data.title}</p>
      <p className='msg-description'>{props.data.text}</p>
    </div>
  );
};
