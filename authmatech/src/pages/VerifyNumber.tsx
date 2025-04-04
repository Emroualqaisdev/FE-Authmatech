import React, {
    useState,
    useEffect,
    useRef,
    Fragment,
    FormEvent,
  } from 'react';
  
  import { useNavigate, useLocation } from 'react-router-dom';
  import { Combobox, Transition } from '@headlessui/react';
  
  interface Country {
    name: string;
    countryCode: string;
    code: string;
  }
  
  const countries: Country[] = [
    { name: 'Jordan', countryCode: 'JO', code: '+962' },
    { name: 'United States', countryCode: 'US', code: '+1' },
    { name: 'United Kingdom', countryCode: 'UK', code: '+44' },
    { name: 'Canada', countryCode: 'CA', code: '+1' },
    { name: 'Australia', countryCode: 'AU', code: '+61' },
  ];
  
  const VerifyNumber: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
  
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
    const [query, setQuery] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [processingReturn, setProcessingReturn] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const filteredCountries = query === ''
      ? countries
      : countries.filter((country) => {
          const searchLower = query.toLowerCase();
          const codePlain = country.code.replace('+', '');
          const codeWith00 = '00' + codePlain;
  
          return (
            country.name.toLowerCase().includes(searchLower) ||
            country.countryCode.toLowerCase().includes(searchLower) ||
            country.code.toLowerCase().includes(searchLower) ||
            codePlain.includes(searchLower) ||
            codeWith00.includes(searchLower)
          );
        });
  
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const encryptedValue = params.get('e');
      const errorCode = params.get('ec');
  
      if (encryptedValue && errorCode === '0') {
        setProcessingReturn(true);
  
        const verifyWithEncryptedValue = async () => {
          try {
            setLoading(true);
            const fullPhoneNumber = localStorage.getItem('pendingPhoneNumber');
            if (!fullPhoneNumber) throw new Error('No pending phone number found');
  
            const verificationPayload = {
              clientId: '6bd57c0a-6e4b-4fae-88cf-f22ab89c8d5d',
              mobileNumber: fullPhoneNumber,
              encryptedMobileNumber: encryptedValue,
            };
  
            const verifyResponse = await fetch(
              'https://be-authmatech-production.up.railway.app/v1/api/verify',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationPayload),
              }
            );
  
            if (!verifyResponse.ok) throw new Error('Failed to verify number');
  
            const verifyResult = await verifyResponse.json();
            const { validNumber } = verifyResult.data;
  
            localStorage.removeItem('pendingPhoneNumber');
  
            navigate(validNumber ? '/verification-success' : '/verification-failed');
          } catch (error) {
            console.error('Verification error:', error);
            setError('Failed to verify your number. Please try again.');
          } finally {
            setLoading(false);
            setProcessingReturn(false);
          }
        };
  
        verifyWithEncryptedValue();
      } else if (errorCode) {
        setError('Failed to verify your number. Please try again.');
      }
    }, [location.search, navigate]);
  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
  
      const cleanCountryCode = selectedCountry.code.replace('+', '');
      const cleanPhone = phoneInput.startsWith('0') ? phoneInput.substring(1) : phoneInput;
      const fullPhoneNumber = cleanCountryCode + cleanPhone;
  
      try {
        localStorage.setItem('pendingPhoneNumber', fullPhoneNumber);
  
        window.location.href = `http://www.dot-jo.biz/appgw/PartnerHERedirect?partnerId=partner-a5601b8b&rurl=${encodeURIComponent(
          'https://www.authmatech.com/example'
        )}`;
      } catch (error) {
        console.error('Redirection error:', error);
        setError('Failed to redirect to verification service.');
        setLoading(false);
      }
    };
  
    if (processingReturn) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Verifying Your Number</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">Please wait while we verify your number...</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify Your Phone Number</h2>
  
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Code Selection */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country Code
              </label>
              <Combobox value={selectedCountry} onChange={(country) => {
                setSelectedCountry(country);
                setIsFocused(false);
              }}>
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    displayValue={(country: Country) => `${country.name} (${country.code})`}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M10 17a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Combobox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                    show={isFocused}
                  >
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredCountries.length === 0 && query !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredCountries.map((country) => (
                          <Combobox.Option
                            key={country.countryCode}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                              }`
                            }
                            value={country}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {country.name} ({country.code})
                                </span>
                                {selected && (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? 'text-white' : 'text-indigo-600'
                                    }`}
                                  >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>
  
            {/* Phone Number Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  {selectedCountry.code}
                </span>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300"
                  placeholder="123456789"
                  required
                />
              </div>
            </div>
  
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || phoneInput.trim() === ''}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || phoneInput.trim() === ''
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Number'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default VerifyNumber;
  