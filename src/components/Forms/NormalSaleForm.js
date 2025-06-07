
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { vehiclesAPI, salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NormalSaleForm = ({ onSuccess }) => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const watchHasLoan = watch('hasLoan');
  const watchVehicle = watch('vehicle');
  const watchLoanAmount = watch('loanAmount', 0);
  const watchDocCharge = watch('docCharge', 0);
  const watchDownPayment = watch('downPayment', 0);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Auto-calculate total amount
    const loanAmount = parseFloat(watchLoanAmount) || 0;
    const docCharge = parseFloat(watchDocCharge) || 0;
    const downPayment = parseFloat(watchDownPayment) || 0;
    const totalAmount = loanAmount + docCharge + downPayment;
    setValue('totalAmount', totalAmount);
  }, [watchLoanAmount, watchDocCharge, watchDownPayment, setValue]);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getNewVehicles();
      setVehicles(response.data.filter(v => v.isAvailable));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Convert string values to numbers where needed
      const formattedData = {
        ...data,
        c2cPrice: parseFloat(data.c2cPrice),
        discount: parseFloat(data.discount) || 0,
        downPayment: parseFloat(data.downPayment),
        loanAmount: data.hasLoan ? parseFloat(data.loanAmount) : 0,
        docCharge: parseFloat(data.docCharge) || 0,
        hasLoan: data.hasLoan === 'true',
        mas: data.mas === 'true',
        deliveryDate: new Date(data.deliveryDate).toISOString(),
      };

      await salesAPI.createNormalSale(formattedData);
      toast.success('Sale recorded successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v._id === watchVehicle);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Normal Sale Form
        </h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Location and Delivery Date */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <select
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Location</option>
                <option value="Thanjavur">Thanjavur</option>
                <option value="Mayiladuthurai">Mayiladuthurai</option>
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Date *
              </label>
              <input
                type="date"
                {...register('deliveryDate', { required: 'Delivery date is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.deliveryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDate.message}</p>
              )}
            </div>
          </div>

          {/* Salesman */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salesman *
            </label>
            <input
              type="text"
              {...register('salesman', { required: 'Salesman name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter salesman name"
            />
            {errors.salesman && (
              <p className="mt-1 text-sm text-red-600">{errors.salesman.message}</p>
            )}
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Customer Details</h4>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  {...register('customer.name', { required: 'Customer name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter customer name"
                />
                {errors.customer?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register('customer.phone', { required: 'Phone number is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter phone number"
                />
                {errors.customer?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.phone.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Flat No
                </label>
                <input
                  type="text"
                  {...register('customer.address.flatNo')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Flat No"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  type="text"
                  {...register('customer.address.street')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District
                </label>
                <input
                  type="text"
                  {...register('customer.address.district')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="District"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  {...register('customer.address.city')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  {...register('customer.address.state')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="State"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Vehicle Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Model *
              </label>
              <select
                {...register('vehicle', { required: 'Vehicle selection is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.model} - ₹{vehicle.price.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.vehicle && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicle.message}</p>
              )}
              {selectedVehicle && (
                <p className="mt-1 text-sm text-gray-600">
                  Base Price: ₹{selectedVehicle.price.toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  C2C Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('c2cPrice', { required: 'C2C price is required', min: 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter C2C price"
                />
                {errors.c2cPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.c2cPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('discount', { min: 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter discount amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Down Payment *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('downPayment', { required: 'Down payment is required', min: 0 })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter down payment"
              />
              {errors.downPayment && (
                <p className="mt-1 text-sm text-red-600">{errors.downPayment.message}</p>
              )}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Loan Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Required
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...register('hasLoan')}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...register('hasLoan')}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {watchHasLoan === 'true' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Finance Company *
                  </label>
                  <input
                    type="text"
                    {...register('financeCompany', { 
                      required: watchHasLoan === 'true' ? 'Finance company is required' : false 
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter finance company"
                  />
                  {errors.financeCompany && (
                    <p className="mt-1 text-sm text-red-600">{errors.financeCompany.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loan Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('loanAmount', { 
                      required: watchHasLoan === 'true' ? 'Loan amount is required' : false,
                      min: 0 
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter loan amount"
                  />
                  {errors.loanAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.loanAmount.message}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                MAS
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...register('mas')}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...register('mas')}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document Charge
              </label>
              <input
                type="number"
                step="0.01"
                {...register('docCharge', { min: 0 })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter document charge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                {...register('totalAmount')}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Recording Sale...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NormalSaleForm;