import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Calculator = () => {
  const [customTipEnabled, setCustomTipEnabled] = useState(false);
  const [customContributionEnabled, setCustomContributionEnabled] = useState(false);
  const [contributors, setContributors] = useState([
    { id: 1, name: "Person 1", percentage: 100, amount: "$0.00", tipAmount: "$0.00" }
  ]);

  useEffect(() => {
    document.title = 'Smart Bill Calculator';
  }, []);

  const [formattedValues, setFormattedValues] = useState({
    tipAmount: "$0.00",
    totalAmount: "$0.00",
    perPerson: "$0.00",
    tipPerPerson: "$0.00"
  });

  const formik = useFormik({
    initialValues: {
      billAmount: '',
      serviceRating: '15',
      numberOfPeople: '1',
    },
    validationSchema: Yup.object({
      billAmount: Yup.number().positive('Amount must be greater than zero').required('Bill Amount is Required'),
      serviceRating: Yup.number().positive('Amount must be greater than zero').required('Service Rating is Required'),
      numberOfPeople: Yup.number().min(1, 'At least one person').required('Number of People is Required'),
    }),
    onSubmit: (values) => {
        if (customContributionEnabled) {
            const total = contributors.reduce((sum, person) => sum + person.percentage, 0);
            if (Math.abs(total - 100) > 0.1) {
              toast.error(`Total percentage is ${total.toFixed(1)}%. It should be 100%.`, {
                position: "top-right",
              });
              return;
            }
          }

      const billAmount = parseFloat(values.billAmount);
      const numberOfPeople = parseInt(values.numberOfPeople);
      const tipPercent = parseFloat(values.serviceRating) / 100;
      const tipAmount = billAmount * tipPercent;
      const totalAmount = billAmount + tipAmount;
      const perPerson = totalAmount / numberOfPeople;
      const tipPerPerson = tipAmount / numberOfPeople;

      const formatCurrency = (amount) => {
        return parseFloat(amount)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      };

      let updatedContributors = [];

      if (customContributionEnabled) {
        updatedContributors = contributors.map(person => {
          const personPercentage = person.percentage / 100;
          const personAmount = totalAmount * personPercentage;
          const personTipAmount = tipAmount * personPercentage;

          return {
            ...person,
            amount: `$${formatCurrency(personAmount)}`,
            tipAmount: `$${formatCurrency(personTipAmount)}`
          };
        });
      } else {
        updatedContributors = Array.from({ length: numberOfPeople }, (_, index) => ({
          id: index + 1,
          name: `Person ${index + 1}`,
          percentage: 100 / numberOfPeople,
          amount: `$${formatCurrency(perPerson)}`,
          tipAmount: `$${formatCurrency(tipPerPerson)}`
        }));
      }

      setContributors(updatedContributors);

      toast.success('Calculation Successful!', {
        position: "top-right",
      });

      setFormattedValues({
        tipAmount: `$${formatCurrency(tipAmount)}`,
        totalAmount: `$${formatCurrency(totalAmount)}`,
        perPerson: `$${formatCurrency(perPerson)}`,
        tipPerPerson: `$${formatCurrency(tipPerPerson)}`
      });
    },
  });

  useEffect(() => {
    if (parseInt(formik.values.numberOfPeople) === 1 && customContributionEnabled) {
      setCustomContributionEnabled(false);
    }
  }, [formik.values.numberOfPeople, customContributionEnabled]);

  useEffect(() => {
    const numberOfPeople = parseInt(formik.values.numberOfPeople) || 1;

    if (!customContributionEnabled) {
      if (contributors.length !== numberOfPeople) {
        const updatedContributors = Array.from({ length: numberOfPeople }, (_, index) => ({
          id: index + 1,
          name: `Person ${index + 1}`,
          percentage: 100 / numberOfPeople,
          amount: "$0.00",
          tipAmount: "$0.00"
        }));
        setContributors(updatedContributors);
      }
    }
  }, [formik.values.numberOfPeople, customContributionEnabled, contributors.length]);

  const handleNameChange = (id, newName) => {
    setContributors(prev =>
      prev.map(person =>
        person.id === id ? { ...person, name: newName } : person
      )
    );
  };

  const handlePercentageChange = (id, newPercentage) => {
    setContributors(prev => {
      const updatedContributors = prev.map(person =>
        person.id === id ? { ...person, percentage: parseFloat(newPercentage) || 0 } : person
      );

      return updatedContributors;
    });
  };

  const addContributor = () => {
    const newId = contributors.length > 0
      ? Math.max(...contributors.map(p => p.id)) + 1
      : 1;

    const newPercentage = 100 / (contributors.length + 1);
    const updatedContributors = contributors.map(person => ({
      ...person,
      percentage: newPercentage
    }));

    setContributors([
      ...updatedContributors,
      {
        id: newId,
        name: `Person ${newId}`,
        percentage: newPercentage,
        amount: "$0.00",
        tipAmount: "$0.00"
      }
    ]);

    formik.setFieldValue('numberOfPeople', contributors.length + 1);

    toast.success('Contributor Added Successfully!', {
        position: "top-right",
    });
  };

  const removeContributor = (id) => {
    if (contributors.length <= 1) {
      toast.error("Cannot remove the only contributor", {
        position: "top-right",
      });
      return;
    }

    const updatedContributors = contributors.filter(person => person.id !== id);

    const newPercentage = 100 / updatedContributors.length;
    const redistributedContributors = updatedContributors.map(person => ({
      ...person,
      percentage: newPercentage
    }));

    setContributors(redistributedContributors);

    formik.setFieldValue('numberOfPeople', updatedContributors.length);

    toast.success('Contributor Removed Successfully!', {
        position: "top-right",
    });
  };

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col items-center justify-center p-8">
      <header className="text-center p-8 bg-gray-700 w-full rounded-lg shadow-lg mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Smart Bill Calculator</h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Easily calculate and split your bill with friends, considering service quality and custom contribution percentages.
        </p>
      </header>

      <div className="max-w-6xl w-full p-8 bg-gray-700 rounded-lg shadow-lg flex gap-12 flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-6">
              <label htmlFor="billAmount" className="block text-lg font-semibold text-gray-100 mb-2">Bill Amount</label>
              <input
                id="billAmount"
                name="billAmount"
                type="number"
                value={formik.values.billAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-4 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-200 text-lg transition-all"
                placeholder="Enter bill amount"
              />
              {formik.touched.billAmount && formik.errors.billAmount && (
                <div className="text-red-400 text-sm">{formik.errors.billAmount}</div>
              )}
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="customTipToggle"
                checked={customTipEnabled}
                onChange={() => setCustomTipEnabled(!customTipEnabled)}
                className="w-5 h-5 text-gray-600 bg-gray-700 border-gray-500 rounded focus:ring-gray-500"
              />
              <label htmlFor="customTipToggle" className="text-gray-200 text-lg">Enter custom tip percentage</label>
            </div>

            <div className="mb-6">
              <label htmlFor="serviceRating" className="block text-lg font-semibold text-gray-100 mb-2">
                {customTipEnabled ? "Custom Tip %" : "Service Rating (%)"}
              </label>
              <input
                id="serviceRating"
                name="serviceRating"
                type="number"
                step="0.1"
                disabled={!customTipEnabled}
                value={formik.values.serviceRating}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full p-4 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-200 text-lg ${!customTipEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={customTipEnabled ? "Enter custom tip percentage" : "Default: 15%"}
              />
              {formik.touched.serviceRating && formik.errors.serviceRating && (
                <div className="text-red-400 text-sm">{formik.errors.serviceRating}</div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="numberOfPeople" className="block text-lg font-semibold text-gray-100 mb-2">Number of People</label>
              <input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                value={formik.values.numberOfPeople}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={customContributionEnabled}
                className={`w-full p-4 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-200 text-lg ${customContributionEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Enter number of people"
              />
              {formik.touched.numberOfPeople && formik.errors.numberOfPeople && (
                <div className="text-red-400 text-sm">{formik.errors.numberOfPeople}</div>
              )}
            </div>

            {parseInt(formik.values.numberOfPeople) > 1 && (
              <div className="mb-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="customContributionToggle"
                  checked={customContributionEnabled}
                  onChange={() => setCustomContributionEnabled(!customContributionEnabled)}
                  className="w-5 h-5 text-gray-600 bg-gray-700 border-gray-500 rounded focus:ring-gray-500"
                />
                <label htmlFor="customContributionToggle" className="text-gray-200 text-lg">Custom contribution percentages</label>
              </div>
            )}

            <button type="submit" className="w-full py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition duration-300 ease-in-out transform hover:scale-105">
              Calculate
            </button>
          </form>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-600 p-6 rounded-lg shadow-lg text-gray-100">
              <p className="text-sm">Tip Amount</p>
              <span className="font-bold text-xl">{formattedValues.tipAmount}</span>
            </div>

            <div className="bg-gray-600 p-6 rounded-lg shadow-lg text-gray-100">
              <p className="text-sm">Total Bill</p>
              <span className="font-bold text-xl">{formattedValues.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Contributors</h2>
            {customContributionEnabled && (
              <button
                onClick={addContributor}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Add Person
              </button>
            )}
          </div>

          {customContributionEnabled ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {contributors.map((person) => (
                <div key={person.id} className="bg-gray-600 p-4 rounded-lg shadow-lg text-gray-100">
                  <div className="flex justify-between mb-2">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handleNameChange(person.id, e.target.value)}
                      className="bg-gray-700 border border-gray-500 rounded px-2 py-1 text-white"
                    />

                    {contributors.length > 1 && (
                      <button
                        onClick={() => removeContributor(person.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="text-sm text-gray-300">Contribution Percentage:</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={person.percentage}
                        onChange={(e) => handlePercentageChange(person.id, e.target.value)}
                        className="w-20 bg-gray-700 border border-gray-500 rounded px-2 py-1 text-white"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="ml-1">%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Amount to Pay</p>
                      <p className="font-bold">{person.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tip Contribution</p>
                      <p className="font-bold">{person.tipAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-600 p-6 rounded-lg shadow-lg text-gray-100">
              <h3 className="font-medium text-xl mb-4">Even Split for {formik.values.numberOfPeople} {parseInt(formik.values.numberOfPeople) === 1 ? 'Person' : 'People'}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-300">Each Person Pays:</p>
                  <p className="font-bold text-xl">{formattedValues.perPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Tip Per Person:</p>
                  <p className="font-bold text-xl">{formattedValues.tipPerPerson}</p>
                </div>
              </div>
            </div>
          )}

          {customContributionEnabled && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-300">
                Total contribution: {contributors.reduce((sum, p) => sum + p.percentage, 0).toFixed(1)}%
                {Math.abs(contributors.reduce((sum, p) => sum + p.percentage, 0) - 100) > 0.1 && (
                  <span className="text-yellow-400 ml-2">(Should be 100%)</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Calculator;