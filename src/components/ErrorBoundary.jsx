// src/components/ErrorBoundary.jsx
import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // Initialize state to indicate no error has occurred
    this.state = { hasError: false, error: null };
  }

  // This lifecycle method is called when an error is thrown during rendering,
  // in a lifecycle method, or in the constructor of any child component.
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  // This lifecycle method is called after an error has been thrown by a descendant component.
  // It receives the error that was thrown as a parameter.
  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
    // Optionally, you could send this error to a logging service like Sentry, LogRocket, etc.
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    // If an error occurred, render the fallback UI
    if (this.state.hasError) {
      return (
        <Result
          status="error" // Use Ant Design's error status styling
          title="Something went wrong"
          subTitle="We're sorry, but there was an error loading this part of the application."
          // Provide an action to reload the application
          extra={[
            <Button
               type="primary"
               key="reload"
               // Reload the page when the button is clicked
               onClick={() => window.location.reload()}
            >
              Reload App
            </Button>,
          ]}
        />
      );
    }

    // If no error occurred, render the children components as usual
    return this.props.children;
  }
}

export default ErrorBoundary;
