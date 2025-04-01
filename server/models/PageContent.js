// models/PageContent.js
import mongoose from 'mongoose';

const PageContentSchema = new mongoose.Schema({
  // Home Section
  home: {
    headerTitle: {
      type: String,
      required: true,
      default: 'Prarthna Manufacturing Pvt. Ltd.'
    },
    // Words used in the typewriter effect
    typewriterWords: {
      type: [String],
      default: [
        'High-Quality Sheet Metal Products',
        'Cutting-Edge Fabrication',
        'Innovative Manufacturing Solutions'
      ]
    },
    // Service highlight texts
    services: {
      title: {
        type: String,
        default: 'Our Services'
      },
      description: {
        type: String,
        default: 'Fabrication • Innovation • Reliability'
      }
    },
    // Call-to-action button texts (if needed to be configurable)
    ctaButtons: {
      login: {
        type: String,
        default: 'Login'
      },
      signup: {
        type: String,
        default: 'Signup'
      }
    }
  },
  // About Section
  about: {
    title: {
      type: String,
      default: 'About Us & Capabilities'
    },
    // Storing paragraphs as an array allows for flexibility.
    paragraphs: {
      type: [String],
      default: [
        "Prarthna Manufacturing Pvt. Ltd. is a leader in manufacturing sheet metal products in India. With operations across Bhandup and Khopoli near Mumbai, we deploy state-of-the-art systems and processes to manufacture various types of sheet metal products, components, parts, and articles. We are respected for our skills, innovation, craftsmanship, process engineering expertise, value engineering interventions, and quality of service.",
        "Our products cater to various industries: Furniture Industries, Switch Gear Industries, Automobile Industries, Warehouse / Storage Industries, Kitchen Metal Products, Home Appliance, Network Industries, Others.",
        "We support client processes with our decades of excellence in manufacturing sheet metal components, robust production planning, and process engineering expertise."
      ]
    }
  },
  // Contact Section
  contact: {
    title: {
      type: String,
      default: 'Contact Us'
    },
    introduction: {
      type: String,
      default: 'Reach out to us for any inquiries or information.'
    },
    address: {
      type: String,
      default: 'Kedia Industrial Area, Dheku, Village, Khalapur, Maharashtra 410203'
    },
    email: {
      type: String,
      default: 'info@prarthna.co.in'
    },
    telephone: {
      type: String,
      default: '022 2167 0087'
    },
    // Google Maps embed URL for the contact section
    googleMapEmbedUrl: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15918.218460704233!2d72.93424474999999!3d19.170955449999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9a5f4c2d9d3%3A0xd6cbe991983dad0!2sRedwoods%20Co-operative%20Housing%20Society%20B-Wing!5e1!3m2!1sen!2sin!4v1739953071938!5m2!1sen!2sin'
    }
  }
}, { timestamps: true });

const PageContent = mongoose.model('PageContent', PageContentSchema);

export default PageContent;
