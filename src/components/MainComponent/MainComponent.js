import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MainComponent.css';

const MainComponent = () => {
    const [readerId, setReaderId] = useState('none');
    const [amount, setAmount] = useState('');
    const [messages, setMessages] = useState([]);

    const [readersList, setReadersList] = useState([]);
    const [reader, setReader] = useState(null);
    const [paymentIntent, setPaymentIntent] = useState(null);

    // Helper function to add messages
    const addMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Helpers
    const reset = () => {
        const newPaymentIntent = null;
        const newAmount = '';
        const newReader = 'null';

        setPaymentIntent(newPaymentIntent);
        setAmount(newAmount);
        setReader(newReader);
    };

    // Get readers before mounting the component (onBeforeMount in the Vue.js example)
    useEffect(() => {
        const fetchReadersList = async () => {
            const response = await fetch("http://localhost:4242/readers");
            console.log(response)
            const result = await response.json();
            console.log(result)
            setReadersList(result.readersList);
        };

        fetchReadersList();
    }, []);

    // Process payment click handler
    const processPayment = async () => {
        try {
            const response = await fetch("http://localhost:4242/readers/process-payment", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ amount: amount, readerId: readerId })
            });
            const result = await response.json();
            console.log(result)
            const { error } = result;
            if (error){
                addMessage(error.message);
                return;
            }
            console.log(result.reader)
            console.log(result.paymentIntent)
            setReader(result.reader);
            setPaymentIntent(result.paymentIntent);
            addMessage(`Processing payment for ${amount} on reader ${result.reader.label}`)
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    // Cancel action click handler
    const cancelAction = async () => {
        try {
            const response = await fetch("http://localhost:4242/readers/cancel-action", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ readerId: readerId })
            });

            const result = await response.json();
            const { error } = result;

            if (error) {
                addMessage(error.message);
                return;
            }

            setReader(result.reader);
            addMessage(`Cancelled reader action on ${result.reader.label} (${result.reader.id})`);
            reset();
        } catch (error) {
            console.error('Error cancelling action:', error);
        }
    };

    // Simulate payment click handler
    const simulatePayment = async () => {};

    // Capture payment click handler
    const capturePayment = async () => {
        try {
            const response = await fetch("http://localhost:4242/payments/capture", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ paymentIntentId: paymentIntent.id })
            });

            const result = await response.json();
            const { error } = result;

            if (error) {
                addMessage(error.message);
                return;
            }

            setPaymentIntent(result.paymentIntent);
            addMessage(`Captured payment for ${result.paymentIntent.id}`);
            reset(); // reset application state
        } catch (error) {
            console.error('Error capturing payment:', error);
        }
    };


    // Computed properties (useMemo) to handle enabling and disabling of buttons
    const isSimulateable = React.useMemo(() => {
        return (
            reader &&
            reader.device_type &&
            reader.device_type.includes('simulated') &&
            paymentIntent?.id
        );
    }, [reader, paymentIntent]);

    const isCapturable = React.useMemo(() => {
        return paymentIntent?.id;
    }, [paymentIntent]);

    const isProcessable = React.useMemo(() => {
        return amount >= 100 && readerId;
    }, [amount, readerId]);

    return (
        <div className="MainComponent">
            <div className="sr-root">
                <main className="sr-main">
                    <h2>Collecting Payments with Stripe Terminal</h2>
                    <p>Select a reader and input an amount for the transaction.</p>
                    <p>
                        You can use amounts ending in the certain values to produce specific
                        responses. See
                        <a
                            href="https://stripe.com/docs/terminal/references/testing#physical-test-cards"
                        >the documentation</a
                        >
                        for more details.
                    </p>
                    <section>
                        <div>
                            <p>
                                <strong>Payment Intent ID:</strong>
                                {paymentIntent && <span>{paymentIntent.id}</span>}
                            </p>
                            <p>
                                <strong>Payment Intent status:</strong>
                                {paymentIntent && <span>{paymentIntent.status}</span>}
                            </p>
                        </div>
                        <p>
                            <strong>Reader Status:</strong>
                            {reader && <span>{reader?.action?.status}</span>}
                        </p>
                    </section>
                    <form id="confirm-form">
                        <label>Select Reader: </label>
                        <select
                            value={readerId}
                            onChange={(e) => setReaderId(e.target.value)}
                            name="reader"
                            id="reader-select"
                            className="sr-select"
                        >
                            <option value="none" disabled>Select a reader</option>
                            {readersList.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {`${r.label} (${r.id})`}
                                </option>
                            ))}
                        </select>
                        <section className="sr-form-row">
                            <label htmlFor="amount">Amount:</label>
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                id="amount"
                                className="sr-input"
                            />
                        </section>
                        <section className="button-row">
                            <button
                                type="button"
                                id="capture-button"
                                onClick={processPayment}
                                disabled={!isProcessable}
                            >
                                Process
                            </button>
                            <button
                                type="button"
                                id="capture-button"
                                onClick={capturePayment}
                                disabled={!isCapturable}
                            >
                                Capture
                            </button>
                        </section>
                        <section className="button-row">
                            <button
                                id="simulate-payment-button"
                                onClick={simulatePayment}
                                type="button"
                                disabled={!isSimulateable}
                            >
                                Simulate Payment
                            </button>
                            <button onClick={cancelAction} id="cancel-button" type="button">
                                Cancel
                            </button>
                        </section>
                        <div>
                            {/* Afficher les messages */}
                            {messages.map((message, index) => (
                                <div key={index}>{message}</div>
                            ))}
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

MainComponent.propTypes = {
    // Define your prop types if needed
};

MainComponent.defaultProps = {};

export default MainComponent;
