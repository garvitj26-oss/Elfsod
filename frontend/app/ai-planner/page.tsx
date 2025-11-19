'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Megaphone, Users, ShoppingCart, ArrowRight as Traffic, Calendar, DollarSign, Target, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Goal = 'brand_awareness' | 'engagement' | 'conversions' | 'traffic' | null;

const goals = [
  { 
    id: 'brand_awareness' as const, 
    icon: Megaphone, 
    title: 'Brand Awareness', 
    description: 'Increase brand visibility',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'engagement' as const, 
    icon: Users, 
    title: 'Engagement', 
    description: 'Drive audience interaction',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'conversions' as const, 
    icon: ShoppingCart, 
    title: 'Conversions', 
    description: 'Generate sales & leads',
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'traffic' as const, 
    icon: Traffic, 
    title: 'Traffic', 
    description: 'Drive website/store visits',
    color: 'from-pink-500 to-pink-600'
  },
];

export default function AIPlannerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<Goal>(null);
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState(5000);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const progress = (currentStep / 6) * 100;

  const handleContinue = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate plan and show recommendations
      router.push('/ai-planner/recommendations');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1: return selectedGoal !== null;
      case 2: return productDescription.length > 20;
      case 3: return targetAudience.length > 10;
      case 4: return budget > 0;
      case 5: return startDate !== null;
      default: return true;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E91E63] to-[#F50057] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Campaign Planner</h1>
              <p className="text-sm text-gray-600">Let AI find the perfect ad spaces for your campaign</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E91E63] to-[#F50057] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-[80px] text-right">
              Step {currentStep} of 6
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* Step 1: Campaign Goal */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  What's your campaign goal?
                </h2>
                <p className="text-gray-600">Choose the primary objective for your campaign</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#E91E63] bg-[#E91E63]/5 scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                      {isSelected && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-[#E91E63]">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Product Description */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Tell us about your product or service
                </h2>
                <p className="text-gray-600">Describe what you're promoting in detail</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="E.g., We're launching a new eco-friendly water bottle that keeps drinks cold for 24 hours. It's made from recycled materials and comes in 5 vibrant colors..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E91E63] resize-none text-gray-900"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">Minimum 20 characters</span>
                  <span className={`text-sm font-medium ${productDescription.length >= 20 ? 'text-[#4CAF50]' : 'text-gray-400'}`}>
                    {productDescription.length} characters
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Who is your target audience?
                </h2>
                <p className="text-gray-600">Define your ideal customer profile</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2 text-[#E91E63]" />
                    Audience Description
                  </label>
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="E.g., Young professionals aged 25-40, health-conscious, interested in sustainability..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E91E63] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]">
                      <option>18-24</option>
                      <option>25-34</option>
                      <option>35-44</option>
                      <option>45+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Income Level</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]">
                      <option>Lower</option>
                      <option>Middle</option>
                      <option>Upper Middle</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">What's your budget?</h2>
                <p className="text-gray-600">Enter your total campaign budget</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <DollarSign className="w-12 h-12 text-[#E91E63] mx-auto mb-4" />
                  <div className="text-6xl font-bold text-gray-900 mb-4">
                    ${budget.toLocaleString()}
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-[#E91E63]"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1000, 2500, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBudget(amount)}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                        budget === amount
                          ? 'border-[#E91E63] bg-[#E91E63] text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Duration */}
          {currentStep === 5 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  When do you want to run your campaign?
                </h2>
                <p className="text-gray-600">Select start and end dates</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2 text-[#E91E63]" />
                      Start Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      minDate={new Date()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      dateFormat="MMM dd, yyyy"
                      placeholderText="Select start date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2 text-[#E91E63]" />
                      End Date (Optional)
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      minDate={startDate || new Date()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      dateFormat="MMM dd, yyyy"
                      placeholderText="Select end date"
                    />
                  </div>
                </div>
                {startDate && endDate && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Campaign Duration:</span>{' '}
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Review Your Campaign
                </h2>
                <p className="text-gray-600">Make sure everything looks good before we generate your plan</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Campaign Goal</h3>
                    <p className="text-gray-600 capitalize">{selectedGoal?.replace('_', ' ')}</p>
                  </div>
                  <button onClick={() => setCurrentStep(1)} className="text-[#E91E63] text-sm font-medium hover:underline">
                    Edit
                  </button>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Product Description</h3>
                    <p className="text-gray-600 line-clamp-2">{productDescription}</p>
                  </div>
                  <button onClick={() => setCurrentStep(2)} className="text-[#E91E63] text-sm font-medium hover:underline">
                    Edit
                  </button>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Budget</h3>
                    <p className="text-gray-600">${budget.toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="text-[#E91E63] text-sm font-medium hover:underline">
                    Edit
                  </button>
                </div>
                {startDate && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
                      <p className="text-gray-600">
                        {startDate.toLocaleDateString()} {endDate && `- ${endDate.toLocaleDateString()}`}
                      </p>
                    </div>
                    <button onClick={() => setCurrentStep(5)} className="text-[#E91E63] text-sm font-medium hover:underline">
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleContinue}
              disabled={!canContinue()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                canContinue()
                  ? 'bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentStep === 6 ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Plan
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
