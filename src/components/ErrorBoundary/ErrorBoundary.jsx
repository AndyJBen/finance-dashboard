// src/components/ErrorBoundary.jsx
import React from 'react';
import { Result, Button } from 'antd';
// Make sure there is no line here like: import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="We're sorry, but there was an error loading this part of the application."
          extra={[
            <Button
              type="primary"
              key="reload"
              onClick={() => window.location.reload()}
            >
              Reload App
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
