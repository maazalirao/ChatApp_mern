const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

console.log('Verifying Tailwind CSS installation...');

// Check if tailwind.config.js exists
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
if (fileExists(tailwindConfigPath)) {
  console.log('✅ tailwind.config.js exists');
} else {
  console.log('❌ tailwind.config.js not found');
}

// Check if postcss.config.js exists
const postcssConfigPath = path.join(__dirname, 'postcss.config.js');
if (fileExists(postcssConfigPath)) {
  console.log('✅ postcss.config.js exists');
} else {
  console.log('❌ postcss.config.js not found');
}

// Check if craco.config.js exists
const cracoConfigPath = path.join(__dirname, 'craco.config.js');
if (fileExists(cracoConfigPath)) {
  console.log('✅ craco.config.js exists');
} else {
  console.log('❌ craco.config.js not found');
}

// Check if tailwind CSS files exist
const tailwindCssPath = path.join(__dirname, 'tailwind.css');
if (fileExists(tailwindCssPath)) {
  console.log('✅ tailwind.css exists');
} else {
  console.log('❌ tailwind.css not found');
}

const tailwindOutputPath = path.join(__dirname, 'src', 'tailwind-output.css');
if (fileExists(tailwindOutputPath)) {
  console.log('✅ src/tailwind-output.css exists');
} else {
  console.log('❌ src/tailwind-output.css not found');
}

// Check package.json for required dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fileExists(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for tailwindcss
    const hasTailwind = packageJson.devDependencies && packageJson.devDependencies.tailwindcss;
    if (hasTailwind) {
      console.log(`✅ tailwindcss found in devDependencies (version: ${packageJson.devDependencies.tailwindcss})`);
    } else {
      console.log('❌ tailwindcss not found in devDependencies');
    }
    
    // Check for postcss
    const hasPostcss = packageJson.devDependencies && packageJson.devDependencies.postcss;
    if (hasPostcss) {
      console.log(`✅ postcss found in devDependencies (version: ${packageJson.devDependencies.postcss})`);
    } else {
      console.log('❌ postcss not found in devDependencies');
    }
    
    // Check for autoprefixer
    const hasAutoprefixer = packageJson.devDependencies && packageJson.devDependencies.autoprefixer;
    if (hasAutoprefixer) {
      console.log(`✅ autoprefixer found in devDependencies (version: ${packageJson.devDependencies.autoprefixer})`);
    } else {
      console.log('❌ autoprefixer not found in devDependencies');
    }
    
    // Check for craco
    const hasCraco = packageJson.dependencies && packageJson.dependencies['@craco/craco'];
    if (hasCraco) {
      console.log(`✅ @craco/craco found in dependencies (version: ${packageJson.dependencies['@craco/craco']})`);
    } else {
      console.log('❌ @craco/craco not found in dependencies');
    }
    
  } catch (err) {
    console.log('❌ Error reading package.json:', err.message);
  }
} else {
  console.log('❌ package.json not found');
}

console.log('\nVerification complete!'); 