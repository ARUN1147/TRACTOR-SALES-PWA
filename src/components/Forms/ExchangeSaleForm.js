import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { vehiclesAPI, salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ExchangeSaleForm = ({ onSuccess }) => {
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
  const watchUsedVehiclePrice = watch('usedVehicleDetails.priceTaken', 0);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Auto-calculate total amount (subtract used vehicle price for exchange)
    const loanAmount = parseFloat(watchLoanAmount) || 0;
    const docCharge = parseFloat(watchDocCharge) || 0;
    const downPayment = parseFloat(watchDownPayment) || 0;
    const usedVehiclePrice = parseFloat(watchUsedVehiclePrice) || 0;
    const totalAmount = loanAmount + docCharge + downPayment - usedVehiclePrice;
    setValue('totalAmount', Math.max(0, totalAmount)); // Ensure non-negative
  }, [watchLoanAmount, watchDocCharge, watchDownPayment, watchUsedVehiclePrice, setValue]);

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
      // Format data for API
      const formattedData = {
        location: data.location,
        deliveryDate: new Date(data.deliveryDate).toISOString(),
        salesman: data.salesman,
        customer: {
          name: data.customer.name,
          phone: data.customer.phone,
          address: data.customer.address
        },
        vehicle: data.vehicle,
        c2cPrice: parseFloat(data.c2cPrice),
        discount: parseFloat(data.discount) || 0,
        downPayment: parseFloat(data.downPayment),
        hasLoan: data.hasLoan === 'true',
        financeCompany: data.hasLoan === 'true' ? data.financeCompany : undefined,
        mas: data.mas === 'true',
        loanAmount: data.hasLoan === 'true' ? parseFloat(data.loanAmount) : 0,
        docCharge: parseFloat(data.docCharge) || 0,
        usedVehicleDetails: {
          make: data.usedVehicleDetails.make,
          model: data.usedVehicleDetails.model,
          customerName: data.usedVehicleDetails.customerName,
          customerPhone: data.usedVehicleDetails.customerPhone,
          customerAddress: data.usedVehicleDetails.customerAddress,
          priceTaken: parseFloat(data.usedVehicleDetails.priceTaken)
        }
      };

      await salesAPI.createExchangeSale(formattedData);
      toast.success('Exchange sale recorded successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating exchange sale:', error);
      toast.error(error.response?.data?.message || 'Failed to record exchange sale');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v._id === watchVehicle);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Exchange Sale Form
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Record a sale with trade-in vehicle
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Sale Information */}
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900">Sale Information</h4>
            
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

            {/* Customer Address */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Flat No</label>
                <input
                  type="text"
                  {...register('customer.address.flatNo')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Flat No"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  {...register('customer.address.street')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District</label>
                <input
                  type="text"
                  {...register('customer.address.district')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="District"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  {...register('customer.address.city')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  {...register('customer.address.state')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="State"
                />
              </div>
            </div>
          </div>

          {/* New Vehicle Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">New Vehicle Details</h4>
            
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

          {/* Used Vehicle Details */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="text-md font-medium text-gray-900">Trade-in Vehicle Details</h4>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Make *
                </label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.make', { required: 'Vehicle make is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter vehicle make"
                />
                {errors.usedVehicleDetails?.make && (
                  <p className="mt-1 text-sm text-red-600">{errors.usedVehicleDetails.make.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Model *
                </label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.model', { required: 'Vehicle model is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter vehicle model"
                />
                {errors.usedVehicleDetails?.model && (
                    <p className="mt-1 text-sm text-red-600">{errors.usedVehicleDetails.model.message}</p>
                )}
              </div>
            </div>
 
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Previous Owner Name *
                </label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.customerName', { required: 'Previous owner name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter previous owner name"
                />
                {errors.usedVehicleDetails?.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.usedVehicleDetails.customerName.message}</p>
                )}
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Previous Owner Phone *
                </label>
                <input
                  type="tel"
                  {...register('usedVehicleDetails.customerPhone', { required: 'Previous owner phone is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter phone number"
                />
                {errors.usedVehicleDetails?.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.usedVehicleDetails.customerPhone.message}</p>
                )}
              </div>
            </div>
 
            {/* Previous Owner Address */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Flat No</label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.customerAddress.flatNo')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Flat No"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.customerAddress.street')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District</label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.customerAddress.district')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="District"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.customerAddress.city')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  {...register('usedVehicleDetails.customerAddress.state')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="State"
                />
              </div>
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Taken for Trade-in *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('usedVehicleDetails.priceTaken', { required: 'Trade-in price is required', min: 0 })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter trade-in price"
              />
              {errors.usedVehicleDetails?.priceTaken && (
                <p className="mt-1 text-sm text-red-600">{errors.usedVehicleDetails.priceTaken.message}</p>
              )}
            </div>
          </div>
 
          {/* Loan Details */}
          <div className="space-y-4 border-t pt-6">
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
                Total Amount (After Trade-in Deduction)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('totalAmount')}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                placeholder="Auto-calculated"
              />
              <p className="mt-1 text-xs text-gray-500">
                Total = Loan Amount + Doc Charge + Down Payment - Trade-in Price
              </p>
            </div>
          </div>
 
          {/* Submit Button */}
          <div className="flex justify-end border-t pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Recording Exchange Sale...' : 'Record Exchange Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
 };
 
 export default ExchangeSaleForm;
                 