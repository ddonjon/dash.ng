import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, MessageCircle, FileText, 
  Mail, Phone, ChevronDown, ChevronUp, ChevronRight,
  HelpCircle, BookOpen, Users, Settings,
  AlertCircle, CheckCircle, Clock, Shield,
  Award, Zap, TrendingUp, DollarSign,
  UserCheck, Smartphone, Lock, Globe,
  ExternalLink
} from 'lucide-react'

export function Help() {
  const navigate = useNavigate()
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'How do I create and publish a listing?',
      answer: 'To create a listing, click on "List Property" from the main menu or the + button on your dashboard. Fill in all the required details including title, description, price, and images. Once you\'re satisfied, click "Publish" to make it visible to potential buyers. You can also save as a draft to complete later.'
    },
    {
      id: 2,
      question: 'How do I edit or manage my existing listings?',
      answer: 'Go to "My Listings" from the drawer menu. You\'ll see all your listings in one place. Click the three dots (⋮) on any listing to access options: View, Edit, or Delete. You can also continue editing draft listings from here.'
    },
    {
      id: 3,
      question: 'What happens when someone inquires about my listing?',
      answer: 'When a potential buyer contacts you through your listing (via WhatsApp or inquiry), you\'ll receive an immediate notification. All inquiries are tracked in your Notifications center, so you never miss a lead.'
    },
    {
      id: 4,
      question: 'How do I save and organize my favorite listings?',
      answer: 'Click the bookmark icon on any listing card or the save button on the detail page. All your saved listings appear in the "Saved" section of the drawer menu, making it easy to revisit properties you\'re interested in.'
    },
    {
      id: 5,
      question: 'How do I change my account password?',
      answer: 'Go to Settings → Account → Change Password. Enter your new password (minimum 6 characters) and confirm it. Your password will be updated immediately and you\'ll remain logged in.'
    },
    {
      id: 6,
      question: 'How do I delete my account?',
      answer: 'Go to Settings → Delete Account. This action is permanent and irreversible. It will remove all your listings, saved items, profile data, and personal information from our system.'
    },
    {
      id: 7,
      question: 'What is a draft listing?',
      answer: 'A draft is a listing you\'ve started but haven\'t published yet. Drafts are saved automatically so you can come back later to complete them. They\'re only visible to you until you decide to publish.'
    },
    {
      id: 8,
      question: 'How do I contact sellers or agents?',
      answer: 'Every listing has a "Chat on WhatsApp" button. Click it to start a direct conversation with the seller or agent. This is the fastest way to ask questions, schedule viewings, or negotiate.'
    },
    {
      id: 9,
      question: 'Is my personal information secure on Dash?',
      answer: 'Yes. We take your privacy and security seriously. All data is encrypted, and we never share your personal information with third parties. Your phone number and email are only visible to potential buyers when you choose to engage.'
    },
    {
      id: 10,
      question: 'What happens to my listings when I\'m not active?',
      answer: 'Your listings remain active and visible until you decide to deactivate or delete them. We recommend keeping your contact information up to date so potential buyers can reach you.'
    },
    {
      id: 11,
      question: 'Can I post multiple listings?',
      answer: 'Yes! You can create as many listings as you want. Each listing is independent and can be managed separately from your dashboard. There\'s no limit to the number of listings you can create.'
    },
    {
      id: 12,
      question: 'What payment methods are accepted?',
      answer: 'Dash is a classifieds platform that connects buyers and sellers. We don\'t process payments directly. All transactions are handled between you and the other party. We recommend using secure payment methods and verifying identities.'
    }
  ]

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const helpTopics = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn how to use Dash and create your first listing',
      details: 'Our platform is designed to be intuitive. Start by creating your profile, then list your first item. Follow our step-by-step guide to get the most out of Dash.',
      color: 'text-purple-600 bg-purple-50',
      action: 'Create Your First Listing',
      actionLink: '/list-property'
    },
    {
      icon: TrendingUp,
      title: 'Tips for Success',
      description: 'Best practices to sell faster and get more inquiries',
      details: 'High-quality images, detailed descriptions, competitive pricing, and quick responses to inquiries all help you sell faster. Engage with potential buyers promptly.',
      color: 'text-emerald-600 bg-emerald-50',
      action: 'View My Listings',
      actionLink: '/my-listings'
    },
    {
      icon: Users,
      title: 'Community Guidelines',
      description: 'Our rules for a safe and fair marketplace',
      details: 'We maintain a respectful marketplace. Be honest in your listings, respond to inquiries professionally, and treat all users with respect. Report any suspicious activity.',
      color: 'text-blue-600 bg-blue-50',
      action: 'Report an Issue',
      actionLink: null
    },
    {
      icon: Shield,
      title: 'Safety & Security',
      description: 'Stay safe while buying and selling',
      details: 'Always meet in public places, verify identities, trust your instincts, and never share financial information. We provide tools to help you make informed decisions.',
      color: 'text-red-600 bg-red-50',
      action: 'Learn More',
      actionLink: null
    }
  ]

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Help & FAQ</h1>
            <p className="text-[10px] text-gray-500 font-medium">Everything you need to know about Dash</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/20">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Welcome to Dash Help Center</h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Dash is your trusted marketplace platform for buying and selling. Whether you're a first-time user or a seasoned seller, 
                this guide will help you navigate all features and get the most out of your experience.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span>Easy to use</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Shield size={14} className="text-blue-500" />
                  <span>Secure platform</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Zap size={14} className="text-amber-500" />
                  <span>Fast & responsive</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Award size={14} className="text-purple-500" />
                  <span>Trusted community</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Topics */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-purple-600" />
            Quick Help Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpTopics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${topic.color}`}>
                  <topic.icon size={18} />
                </div>
                <p className="text-base font-bold text-gray-800">{topic.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{topic.details}</p>
                {topic.action && topic.actionLink && (
                  <button 
                    onClick={() => navigate(topic.actionLink)}
                    className="mt-3 text-xs text-purple-600 font-medium hover:text-purple-700 transition flex items-center gap-1"
                  >
                    {topic.action} <ChevronRight size={14} />
                  </button>
                )}
                {topic.action && !topic.actionLink && (
                  <button 
                    onClick={() => alert(`${topic.action} coming soon`)}
                    className="mt-3 text-xs text-gray-400 font-medium hover:text-gray-600 transition flex items-center gap-1"
                  >
                    {topic.action} <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-purple-600" />
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`border-b border-gray-100 last:border-0 ${
                  expandedFaq === faq.id ? 'bg-purple-50/30' : ''
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
                >
                  <span className="text-sm font-medium text-gray-800 flex-1 pr-4">
                    {faq.question}
                  </span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h2 className="text-base font-bold text-gray-800">Trust & Safety</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                <UserCheck size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Verified Users</p>
                <p className="text-xs text-gray-500">We encourage users to verify their accounts for added trust</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Smartphone size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Secure Messaging</p>
                <p className="text-xs text-gray-500">All communications are encrypted and private</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Data Protection</p>
                <p className="text-xs text-gray-500">Your personal information is secure and never shared</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Community Standards</p>
                <p className="text-xs text-gray-500">We maintain a fair and respectful marketplace for everyone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div id="contact-section" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <h2 className="text-base font-bold text-gray-800">Contact Support</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Our support team is here to help you. Choose the method that works best for you.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => alert('Email support coming soon')}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition border border-transparent"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-700">Email Support</p>
                  <p className="text-xs text-gray-500">We respond within 24 hours</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>

              <button
                onClick={() => alert('Phone support coming soon')}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition border border-transparent"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-700">Phone Support</p>
                  <p className="text-xs text-gray-500">Available 9am - 6pm, Monday to Friday</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>

              <button
                onClick={() => alert('Live chat coming soon')}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition border border-transparent"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-700">Live Chat</p>
                  <p className="text-xs text-gray-500">Instant help from our support team</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700">Quick Response Times</p>
                  <p className="text-xs text-amber-600">We aim to respond to all inquiries within 1-2 business days. For urgent matters, please use the live chat option.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center border-t border-gray-100 pt-6">
          <p className="text-[10px] text-gray-400">
            Dash v1.0.0 • © 2024 Dash Marketplace • All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
