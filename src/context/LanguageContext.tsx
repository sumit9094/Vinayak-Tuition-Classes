'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'EN' | 'GJ';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Navbar
    navHome: "Home",
    navAbout: "About Us",
    navCourses: "Courses",
    navContact: "Contact Us",
    navAdmission: "Admission Form",
    navGallery: "Gallery",
    
    // Hero
    heroRating: "5.0 Star Rating (47+ Google Reviews)",
    heroTitlePart1: "Learn,",
    heroTitlePart2: "Grow & Succeed",
    heroTitlePart3: "From Std. 1 to 12",
    heroSubtitle: "Trusted English & Gujarati Medium Coaching Classes in Kalol. Helping students build confidence, achieve academic excellence, and create a successful future.",
    heroJoinNow: "Join Now",
    heroContactUs: "Contact Us",
    heroBadgeAdmission: "★ Admission Open 2026-27 ★",
    heroCardPrimary: "Std. 1 to 10",
    heroCardPrimaryDesc: "GSEB & CBSE Coaching",
    heroCardCommerce: "Std. 11 & 12",
    heroCardCommerceDesc: "Commerce Specialist",
    heroCardMediums: "Mediums",
    heroCardAttention: "Personal Attention",
    heroCardTests: "Regular Weekly Tests",
    heroCardFaculty: "Experienced Faculty",
    heroCardCall: "Call Now: +91 92281 74188",

    // About Us
    aboutTitle: "About Vinayak Tuition",
    aboutSubtitle: "Building strong foundations and shaping bright futures since our inception.",
    aboutHeading: "Excellence in Education",
    aboutP1: "Vinayak Tuition Classes provides quality education with personal attention and strong academic guidance for students from Standard 1 to 12.",
    aboutP2: "We specialize in Commerce education for Std. 11 & 12 while supporting both English and Gujarati medium students, ensuring language is never a barrier to understanding.",
    aboutP3: "Our experienced faculty focuses on conceptual clarity, regular assessments, and a student-friendly environment that fosters growth and confidence.",
    aboutBadgeCommitment: "100% Commitment",
    aboutBadgeResults: "Top Results",
    aboutLabelClassroom: "Classroom Environment",
    aboutLabelAttention: "Personal Attention",

    // Courses
    coursesTitle: "Our Courses",
    coursesSubtitle: "Tailored educational programs designed to help every student succeed.",
    coursesPrimaryTitle: "Primary Classes",
    coursesPrimarySub: "Std. 1 to 5",
    coursesPrimaryDesc: "Building strong fundamentals with engaging learning methods.",
    coursesSecondaryTitle: "Secondary Classes",
    coursesSecondarySub: "Std. 6 to 10",
    coursesSecondaryDesc: "Comprehensive coaching focusing on conceptual clarity and board exams.",
    coursesHigherTitle: "Higher Secondary",
    coursesHigherSub: "Std. 11 & 12 Commerce",
    coursesHigherDesc: "Specialized commerce coaching for excellent board results.",
    coursesSpecializedTitle: "Specialized Subjects",
    
    // Course subjects
    subjectAccounts: "Accounts",
    subjectStatistics: "Statistics",
    subjectEconomics: "Economics",
    subjectEnglish: "English",
    subjectMaths: "Maths",

    // Medium
    mediumTitle: "Medium of Instruction",
    mediumSubtitle: "Providing quality education in the language you are most comfortable with.",
    mediumEnglishTitle: "English Medium",
    mediumEnglishDesc: "Comprehensive coaching in English, adhering to the latest syllabus patterns with focus on competitive standards.",
    mediumGujaratiTitle: "Gujarati Medium",
    mediumGujaratiDesc: "Excellent teaching methodologies in Gujarati, ensuring deep understanding of complex concepts for regional students.",

    // Why Choose Us
    whyTitle: "Why Choose Us?",
    whySubtitle: "We don't just teach, we mentor. Here is why students and parents trust us.",
    whyF1: "Experienced Teaching",
    whyF2: "Personal Attention",
    whyF3: "Weekly Tests",
    whyF4: "Friendly Environment",
    whyF5: "Small Batch Size",
    whyF6: "Strong Academic Support",

    // Contact
    contactTitle: "Get In Touch",
    contactSubtitle: "Visit our center or contact us for any inquiries.",
    contactLocTitle: "Our Location",
    contactLocDesc: "Vinayak Tuition Classes, Kalol, Gandhinagar, Gujarat",
    contactLocLink: "View on Google Maps",
    contactPhoneTitle: "Phone Number",
    contactPhoneDesc: "Call us or reach out via WhatsApp.",
    contactEmailTitle: "Email Us",
    contactEmailDesc: "For general inquiries and support.",

    // Admission Form
    admissionTitle: "Begin Your Journey",
    admissionSubtitle: "Fill out the admission form below and our team will get in touch with you shortly.",
    admissionSuccessTitle: "Application Received!",
    admissionSuccessDesc: "Thank you for choosing Vinayak Tuition Classes. We will contact you soon.",
    admissionLabelName: "Student Name",
    admissionPlaceholderName: "Enter full name",
    admissionLabelContact: "Parent Contact Number",
    admissionPlaceholderContact: "+91",
    admissionLabelStandard: "Standard",
    admissionPlaceholderStandard: "Select Standard",
    admissionOptionPrimary: "Primary (Std. 1-5)",
    admissionOptionSecondary: "Secondary (Std. 6-10)",
    admissionOptionStd11Com: "Std. 11 Commerce",
    admissionOptionStd12Com: "Std. 12 Commerce",
    admissionLabelMedium: "Medium",
    admissionPlaceholderMedium: "Select Medium",
    admissionOptionEnglish: "English Medium",
    admissionOptionGujarati: "Gujarati Medium",
    admissionLabelMessage: "Message (Optional)",
    admissionPlaceholderMessage: "Any specific subjects or requirements...",
    admissionButtonSubmit: "Submit Application",
    admissionButtonSubmitting: "Submitting...",

    // Faculties
    facultiesTitle: "Our Expert Faculties",
    facultiesSubtitle: "Learn from the best educators dedicated to your academic success.",
    facArvindName: "Dr. Arvind Sharma",
    facArvindRole: "Senior Mathematics Expert",
    facArvindExp: "15+ Years Experience",
    facArvindSub: "Maths & Statistics",
    facMeenaName: "Mrs. Meena Patel",
    facMeenaRole: "Commerce Head",
    facMeenaExp: "12+ Years Experience",
    facMeenaSub: "Accounts & Economics",
    facRajeshName: "Mr. Rajesh Kumar",
    facRajeshRole: "Language Specialist",
    facRajeshExp: "10+ Years Experience",
    facRajeshSub: "English (Eng/Guj Medium)",

    // Reviews
    reviewsTitle: "Student & Parent Reviews",
    reviewsSubtitle: "Don't just take our word for it. See what our community has to say.",
    revRahulName: "Rahul M.",
    revRahulRole: "Student, Std. 12 Commerce",
    revRahulContent: "The best tuition classes in Kalol! The faculties are very supportive and my board exam preparation was excellent. Highly recommended for Commerce.",
    revSnehaName: "Sneha P.",
    revSnehaRole: "Parent",
    revSnehaContent: "Very satisfied with the personal attention my child receives here. The weekly tests really help track progress. A friendly and disciplined environment.",
    revAmitName: "Amit J.",
    revAmitRole: "Student, Std. 10",
    revAmitContent: "The teaching methods are very easy to understand. I used to struggle with Maths, but now it's my favorite subject. Thank you Vinayak Classes!",
    revPriyaName: "Priya D.",
    revPriyaRole: "Student, Std. 11 Commerce",
    revPriyaContent: "Excellent faculty for Accounts and Statistics. They clear all concepts from the basics. The study materials provided are also top-notch.",
    revWriteBtn: "Write a Review",
    revFormTitle: "Share Your Experience",
    revFormName: "Your Name",
    revFormRole: "Role (Student/Parent)",
    revFormMsg: "Your Review",
    revFormSubmit: "Submit Review",
    revFormSubmitting: "Submitting...",
    revFormSuccess: "Review submitted successfully!",

    // Gallery
    galleryTitle: "Life at Vinayak Classes",
    gallerySubtitle: "Glimpses of our engaging learning environment and events.",
    galleryItemClassroom: "Classroom Session",
    galleryItemDoubt: "Doubt Solving",
    galleryItemEvent: "Annual Event",
    galleryItemLibrary: "Library",
    galleryItemStudy: "Group Study",

    // Footer
    footerBrandDesc: "Trusted English & Gujarati Medium Coaching Classes in Kalol. Helping students build confidence, achieve academic excellence, and create a successful future.",
    footerQuickLinks: "Quick Links",
    footerContactUs: "Contact Us",
    footerAddress: "Kalol, Gandhinagar, Gujarat",
    footerCopyright: "All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerWhy: "Why Choose Us",
    footerGallery: "Gallery"
  },
  GJ: {
    // Navbar
    navHome: "હોમ",
    navAbout: "અમારા વિશે",
    navCourses: "કોર્સિસ",
    navContact: "સંપર્ક કરો",
    navAdmission: "પ્રવેશ ફોર્મ",
    navGallery: "ગેલરી",

    // Hero
    heroRating: "5.0 સ્ટાર રેટિંગ (47+ ગૂગલ રીવ્યુ)",
    heroTitlePart1: "શીખો, પ્રગતિ કરો",
    heroTitlePart2: "અને સફળ બનો",
    heroTitlePart3: "ધોરણ ૧ થી ૧૨ માટે",
    heroSubtitle: "કલોલમાં ભરોસાપાત્ર ઇંગ્લિશ અને ગુજરાતી મીડિયમ કોચિંગ ક્લાસીસ. વિદ્યાર્થીઓમાં આત્મવિશ્વાસ વધારવા, શ્રેષ્ઠ શૈક્ષણિક પરિણામો મેળવવા અને સફળ ભવિષ્યના નિર્માણમાં મદદરૂપ.",
    heroJoinNow: "પ્રવેશ મેળવો",
    heroContactUs: "સંપર્ક કરો",
    heroBadgeAdmission: "★ એડમિશન ઓપન ૨૦૨૬-૨૭ ★",
    heroCardPrimary: "ધોરણ ૧ થી ૧૦",
    heroCardPrimaryDesc: "GSEB અને CBSE બોર્ડ",
    heroCardCommerce: "ધોરણ ૧૧ અને ૧૨",
    heroCardCommerceDesc: "કોમર્સ સ્પેશિયાલિસ્ટ",
    heroCardMediums: "માધ્યમ",
    heroCardAttention: "વ્યક્તિગત ધ્યાન",
    heroCardTests: "નિયમિત સાપ્તાહિક ટેસ્ટ",
    heroCardFaculty: "અનુભવી શિક્ષકો",
    heroCardCall: "ફોન કરો: +91 92281 74188",

    // About Us
    aboutTitle: "વિનાયક ટ્યુશન વિશે",
    aboutSubtitle: "શરૂઆતથી જ મજબૂત પાયો બનાવવા અને ઉજ્જવળ ભવિષ્ય ઘડવાનું કાર્ય.",
    aboutHeading: "શિક્ષણમાં શ્રેષ્ઠતા",
    aboutP1: "વિનાયક ટ્યુશન ક્લાસીસ ધોરણ ૧ થી ૧૨ ના વિદ્યાર્થીઓ માટે વ્યક્તિગત ધ્યાન અને મજબૂત શૈક્ષણિક માર્ગદર્શન સાથે ગુણવત્તાયુક્ત શિક્ષણ પ્રદાન કરે છે.",
    aboutP2: "અમે ધોરણ ૧૧ અને ૧૨ માટે કોમર્સ શિક્ષણમાં વિશેતા ધરાવીએ છીએ અને ઇંગ્લિશ તેમજ ગુજરાતી બંને માધ્યમના વિદ્યાર્થીઓને સપોર્ટ કરીએ છીએ, જેથી ભાષા ક્યારેય સમજવામાં અવરોધ ન બને.",
    aboutP3: "અમારા અનુભવી શિક્ષકો કન્સેપ્ટ ક્લેરિટી, નિયમિત મૂલ્યાંકન અને વિદ્યાર્થી-મૈત્રીપૂર્ણ વાતાવરણ પર ધ્યાન કેન્દ્રિત કરે છે જે આત્મવિશ્વાસ વધારે છે.",
    aboutBadgeCommitment: "૧૦૦% પ્રતિબદ્ધતા",
    aboutBadgeResults: "શ્રેષ્ઠ પરિણામ",
    aboutLabelClassroom: "વર્ગખંડનું વાતાવરણ",
    aboutLabelAttention: "વ્યક્તિગત ધ્યાન",

    // Courses
    coursesTitle: "અમારા કોર્સિસ",
    coursesSubtitle: "દરેક વિદ્યાર્થીને સફળ થવા માટે મદદરૂપ કસ્ટમાઇઝ્ડ શૈક્ષણિક પ્રોગ્રામ્સ.",
    coursesPrimaryTitle: "પ્રાથમિક ધોરણો",
    coursesPrimarySub: "ધોરણ ૧ થી ૫",
    coursesPrimaryDesc: "રસપ્રદ શિક્ષણ પદ્ધતિઓ સાથે મજબૂત પાયો બનાવવો.",
    coursesSecondaryTitle: "માધ્યમિક ધોરણો",
    coursesSecondarySub: "ધોરણ ૬ થી ૧૦",
    coursesSecondaryDesc: "કન્સેપ્ટ ક્લેરિટી અને બોર્ડ પરીક્ષાઓ પર ધ્યાન કેન્દ્રિત કરતું શિક્ષણ.",
    coursesHigherTitle: "ઉચ્ચતર માધ્યમિક",
    coursesHigherSub: "ધોરણ ૧૧ અને ૧૨ કોમર્સ",
    coursesHigherDesc: "બોર્ડના ઉત્કૃષ્ટ પરિણામો માટે વિશેષ કોમર્સ કોચિંગ.",
    coursesSpecializedTitle: "ખાસ વિષયો",

    // Course subjects
    subjectAccounts: "નામાના મૂળતત્વો",
    subjectStatistics: "આંકડાશાસ્ત્ર",
    subjectEconomics: "અર્થશાસ્ત્ર",
    subjectEnglish: "અંગ્રેજી",
    subjectMaths: "ગણિત",

    // Medium
    mediumTitle: "શિક્ષણનું માધ્યમ",
    mediumSubtitle: "જે ભાષામાં તમને સૌથી વધુ અનુકૂળતા હોય તે ભાષામાં ગુણવત્તાયુક્ત શિક્ષણ.",
    mediumEnglishTitle: "ઇંગ્લિશ મીડિયમ",
    mediumEnglishDesc: "ઇંગ્લિશ માધ્યમમાં સંપૂર્ણ શિક્ષણ, સ્પર્ધાત્મક સ્તરો પર વિશેષ ધ્યાન સાથે અદ્યતન અભ્યાસક્રમ પદ્ધતિ.",
    mediumGujaratiTitle: "ગુજરાતી મીડિયમ",
    mediumGujaratiDesc: "ગુજરાતી માધ્યમમાં ઉત્કૃષ્ટ શિક્ષણ પદ્ધતિઓ, જેથી પ્રાદેશિક વિદ્યાર્થીઓ માટે જટિલ કન્સેપ્ટ્સને ઊંડાણપૂર્વક સમજાવી શકાય.",

    // Why Choose Us
    whyTitle: "અમને શા માટે પસંદ કરો?",
    whySubtitle: "અમે ફક્ત ભણાવતા નથી, અમે માર્ગદર્શન આપીએ છીએ. આથી જ વિદ્યાર્થીઓ અને વાલીઓ અમારા પર વિશ્વાસ રાખે છે.",
    whyF1: "અનુભવી શિક્ષણ",
    whyF2: "વ્યક્તિગત ધ્યાન",
    whyF3: "સાપ્તાહિક ટેસ્ટ",
    whyF4: "મૈત્રીપૂર્ણ વાતાવરણ",
    whyF5: "નાની બેચ સાઈઝ",
    whyF6: "મજબૂત શૈક્ષણિક સપોર્ટ",

    // Contact
    contactTitle: "સંપર્ક કરો",
    contactSubtitle: "અમારા સેન્ટરની મુલાકાત લો અથવા કોઈપણ પૂછપરછ માટે અમારો સંપર્ક કરો.",
    contactLocTitle: "અમારું સરનામું",
    contactLocDesc: "વિનાયક ટ્યુશન ક્લાસીસ, કલોલ, ગાંધીનગર, ગુજરાત",
    contactLocLink: "ગૂગલ મેપ્સ પર જુઓ",
    contactPhoneTitle: "ફોન નંબર",
    contactPhoneDesc: "અમને કૉલ કરો અથવા વોટ્સએપ દ્વારા સંપર્ક કરો.",
    contactEmailTitle: "ઈમેલ કરો",
    contactEmailDesc: "સામાન્ય પૂછપરછ અને સપોર્ટ માટે.",

    // Admission Form
    admissionTitle: "તમારી સફર શરૂ કરો",
    admissionSubtitle: "નીચે આપેલ પ્રવેશ ફોર્મ ભરો અને અમારી ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.",
    admissionSuccessTitle: "અરજી પત્રક મળી ગયું છે!",
    admissionSuccessDesc: "વિનાયક ટ્યુશન ક્લાસીસ પસંદ કરવા બદલ આભાર. અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.",
    admissionLabelName: "વિદ્યાર્થીનું નામ",
    admissionPlaceholderName: "પૂરું નામ દાખલ કરો",
    admissionLabelContact: "વાલીનો સંપર્ક નંબર",
    admissionPlaceholderContact: "+91",
    admissionLabelStandard: "ધોરણ",
    admissionPlaceholderStandard: "ધોરણ પસંદ કરો",
    admissionOptionPrimary: "પ્રાથમિક (ધોરણ ૧-૫)",
    admissionOptionSecondary: "માધ્યમિક (ધોરણ ૬-૧૦)",
    admissionOptionStd11Com: "ધોરણ ૧૧ કોમર્સ",
    admissionOptionStd12Com: "ધોરણ ૧૨ કોમર્સ",
    admissionLabelMedium: "માધ્યમ",
    admissionPlaceholderMedium: "માધ્યમ પસંદ કરો",
    admissionOptionEnglish: "ઇંગ્લિશ માધ્યમ",
    admissionOptionGujarati: "ગુજરાતી માધ્યમ",
    admissionLabelMessage: "સંદેશ (વૈકલ્પિક)",
    admissionPlaceholderMessage: "કોઈ ચોક્કસ વિષય અથવા જરૂરિયાત...",
    admissionButtonSubmit: "અરજી સબમિટ કરો",
    admissionButtonSubmitting: "સબમિટ થઈ રહ્યું છે...",

    // Faculties
    facultiesTitle: "અમારા નિષ્ણાત શિક્ષકો",
    facultiesSubtitle: "તમારી શૈક્ષણિક સફળતા માટે સમર્પિત શ્રેષ્ઠ શિક્ષકો પાસેથી શીખો.",
    facArvindName: "ડો. અરવિંદ શર્મા",
    facArvindRole: "સિનિયર ગણિત નિષ્ણાત",
    facArvindExp: "૧૫+ વર્ષનો અનુભવ",
    facArvindSub: "ગણિત અને આંકડાશાસ્ત્ર",
    facMeenaName: "શ્રીમતી મીના પટેલ",
    facMeenaRole: "કોમર્સ વિભાગના વડા",
    facMeenaExp: "૧૨+ વર્ષનો અનુભવ",
    facMeenaSub: "નામાના મૂળતત્વો અને અર્થશાસ્ત્ર",
    facRajeshName: "શ્રી રાજેશ કુમાર",
    facRajeshRole: "ભાષા નિષ્ણાત",
    facRajeshExp: "૧૦+ વર્ષનો અનુભવ",
    facRajeshSub: "ઇંગ્લિશ (ઇંગ્લિશ/ગુજરાતી માધ્યમ)",

    // Reviews
    reviewsTitle: "વિદ્યાર્થીઓ અને વાલીઓના અભિપ્રાયો",
    reviewsSubtitle: "માત્ર અમારા શબ્દો પર ન જાવ. અમારો સમુદાય શું કહે છે તે જુઓ.",
    revRahulName: "રાહુલ એમ.",
    revRahulRole: "વિદ્યાર્થી, ધોરણ ૧૨ કોમર્સ",
    revRahulContent: "કલોલમાં શ્રેષ્ઠ ટ્યુશન ક્લાસીસ! શિક્ષકો ખૂબ જ સહાયક છે અને મારી બોર્ડ પરીક્ષાની તૈયારી ઉત્કૃષ્ટ રહી. કોમર્સ માટે ખૂબ જ ભલામણ કરું છું.",
    revSnehaName: "સ્નેહા પી.",
    revSnehaRole: "વાલી",
    revSnehaContent: "મારા બાળકને અહીં મળતા વ્યક્તિગત ધ્યાનથી ખૂબ જ સંતુષ્ટ છું. સાપ્તાહિક પરીક્ષાઓ ખરેખર પ્રગતિ જાણવામાં મદદ કરે છે. મૈત્રીપૂર્ણ અને શિસ્તબદ્ધ વાતાવરણ.",
    revAmitName: "અમિત જે.",
    revAmitRole: "વિદ્યાર્થી, ધોરણ ૧૦",
    revAmitContent: "ભણાવવાની પદ્ધતિઓ સમજવામાં ખૂબ જ સરળ છે. હું ગણિતમાં નબળો હતો, પણ હવે તે મારો મનપસંદ વિષય છે. થેન્ક યુ વિનાયક ક્લાસીસ!",
    revPriyaName: "પ્રિયા ડી.",
    revPriyaRole: "વિદ્યાર્થી, ધોરણ ૧૧ કોમર્સ",
    revPriyaContent: "નામાના મૂળતત્વો અને આંકડાશાસ્ત્ર માટે ઉત્કૃષ્ટ શિક્ષકો છે. તેઓ પાયાથી બધા કન્સેપ્ટ્સ ક્લિયર કરે છે. અભ્યાસ સામગ્રી પણ શ્રેષ્ઠ છે.",
    revWriteBtn: "અભિપ્રાય આપો",
    revFormTitle: "તમારો અનુભવ શેર કરો",
    revFormName: "તમારું નામ",
    revFormRole: "તમે કોણ છો? (વિદ્યાર્થી/વાલી)",
    revFormMsg: "તમારો અભિપ્રાય",
    revFormSubmit: "સબમિટ કરો",
    revFormSubmitting: "સબમિટ થઈ રહ્યું છે...",
    revFormSuccess: "અભિપ્રાય સબમિટ થઈ ગયો છે!",

    // Gallery
    galleryTitle: "વિનાયક ક્લાસીસનું વાતાવરણ",
    gallerySubtitle: "અમારા રસપ્રદ શૈક્ષણિક વાતાવરણ અને કાર્યક્રમોની ઝલક.",
    galleryItemClassroom: "વર્ગખંડ સત્ર",
    galleryItemDoubt: "શંકા નિવારણ",
    galleryItemEvent: "વાર્ષિક ઉત્સવ",
    galleryItemLibrary: "પુસ્તકાલય",
    galleryItemStudy: "સામૂહિક અભ્યાસ",

    // Footer
    footerBrandDesc: "કલોલમાં ભરોસાપાત્ર ઇંગ્લિશ અને ગુજરાતી મીડિયમ કોચિંગ ક્લાસીસ. વિદ્યાર્થીઓમાં આત્મવિશ્વાસ વધારવા, શ્રેષ્ઠ શૈક્ષણિક પરિણામો મેળવવા અને સફળ ભવિષ્યના નિર્માણમાં મદદરૂપ.",
    footerQuickLinks: "ઝડપી લિંક્સ",
    footerContactUs: "સંપર્ક કરો",
    footerAddress: "કલોલ, ગાંધીનગર, ગુજરાત",
    footerCopyright: "તમામ હકો અનામત છે.",
    footerPrivacy: "ગોપનીયતા નીતિ",
    footerTerms: "સેવાની શરતો",
    footerWhy: "અમને શા માટે પસંદ કરો",
    footerGallery: "ગેલરી"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('EN');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved === 'EN' || saved === 'GJ') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['EN'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
