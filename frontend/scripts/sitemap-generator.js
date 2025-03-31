import pkg from 'sitemap';
const { SitemapStream, streamToPromise } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

// Define routes manually since we can't import JSX directly in Node
const routes = {
  public: [
    "/",
    "/create-super-admin",
    "/verification-success",
    "/verification-error",
    "/api/v1/auth/verify/:userId/:uniqueString",
    "/login",
    "/signup",
    "/forgot-password",
    "/verify-otp/:userId",
    "/about",
    "/contact-us",
    "/faq"
  ],
  student: [
    "/student/dashboard",
    "/student/orders",
    "/student/schedules"
  ],
  superAdmin: [
    "/superadmin/dashboard",
    "/superadmin/create-job-order",
    "/superadmin/maintenance/levels",
    "/superadmin/maintenance/departments",
    "/superadmin/maintenance/department-levels",
    "/superadmin/maintenance/units",
    "/superadmin/maintenance/categories",
    "/superadmin/maintenance/sizes",
    "/superadmin/maintenance/prices",
    "/superadmin/maintenance/raw-material-types",
    "/superadmin/maintenance/product-types"
  ],
  jobOrder: [
    "/job-order/dashboard",
    "/job-order/student-orders",
    "/job-order/commercial-orders",
    "/job-order/rentals",
    "/job-order/schedules",
    "/job-order/uniform-production",
    "/job-order/academic-gowns-production",
    "/job-order/commercial-job-production",
    "/job-order/other-productions"
  ],
  bao: [
    "/bao/dashboard",
    "/bao/productions",
    "/bao/inventory",
    "/bao/reports",
    "/bao/sales",
    "/bao/accomplishments"
  ]
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cleanPath = (path) => {
  return path
    .replace(/\/:[^/]+/g, '') // Remove parameters
    .replace(/\/\*$/, '')     // Remove catch-all
    .replace(/^([^/])/, '/$1'); // Ensure leading slash
};

const generateSitemap = async () => {
  const baseUrl = 'https://marsukat.vercel.app';
  
  // Get all unique paths
  const paths = Object.values(routes)
    .flat()
    .map(cleanPath)
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .filter(path => path !== '/*' && path !== '*'); // Remove catch-all routes

  // Create a stream to write to
  const stream = new SitemapStream({ hostname: baseUrl });

  // Add all URLs to the stream
  paths.forEach(path => {
    stream.write({
      url: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.8
    });
  });

  stream.end();

  // Generate sitemap XML
  const sitemap = await streamToPromise(stream).then(data => data.toString());

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Sitemap generated at ${outputPath}`);
};

generateSitemap().catch(console.error); 