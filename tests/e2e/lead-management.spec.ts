import { test, expect } from '@playwright/test'

test.describe('Lead Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/')
    
    // Mock authentication - in a real scenario, you'd set up test data
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'test-token')
    })
  })

  test('should create a new lead successfully', async ({ page }) => {
    // Navigate to leads page
    await page.goto('/leads')
    
    // Click add new lead button
    await page.click('text=Add New Lead')
    
    // Fill in lead form
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('input[name="phone"]', '+1234567890')
    await page.fill('input[name="company"]', 'Test Development Corp')
    await page.selectOption('select[name="budget"]', '$1M - $2M')
    await page.selectOption('select[name="timeline"]', '3-6 months')
    await page.fill('input[name="location"]', 'Katy, TX')
    
    // Select interests
    await page.check('input[value="Residential Development"]')
    await page.check('input[value="Investment Properties"]')
    
    // Add notes
    await page.fill('textarea[name="notes"]', 'Interested in residential development opportunities in Katy area')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success message
    await expect(page.locator('text=Lead created successfully')).toBeVisible()
    
    // Verify lead appears in the list
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=john.doe@example.com')).toBeVisible()
  })

  test('should filter leads by category', async ({ page }) => {
    await page.goto('/leads')
    
    // Click on hot leads filter
    await page.click('text=Hot')
    
    // Verify only hot leads are shown
    await expect(page.locator('.lead-card')).toHaveCount(5) // Assuming 5 hot leads from seed data
    
    // Click on warm leads filter
    await page.click('text=Warm')
    
    // Verify warm leads are shown
    await expect(page.locator('.lead-card')).toHaveCount(10) // Assuming 10 warm leads
  })

  test('should search leads by name or email', async ({ page }) => {
    await page.goto('/leads')
    
    // Search for a specific lead
    await page.fill('input[placeholder="Search leads..."]', 'john.doe@example.com')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Verify search results
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=john.doe@example.com')).toBeVisible()
  })

  test('should view lead details', async ({ page }) => {
    await page.goto('/leads')
    
    // Click on first lead to view details
    await page.click('.lead-card:first-child')
    
    // Verify lead details page loads
    await expect(page.locator('h1')).toContainText('Lead Details')
    
    // Verify lead information is displayed
    await expect(page.locator('.lead-info')).toBeVisible()
    await expect(page.locator('.lead-score')).toBeVisible()
    await expect(page.locator('.lead-interactions')).toBeVisible()
  })

  test('should update lead information', async ({ page }) => {
    await page.goto('/leads')
    
    // Click on first lead to view details
    await page.click('.lead-card:first-child')
    
    // Click edit button
    await page.click('text=Edit')
    
    // Update phone number
    await page.fill('input[name="phone"]', '+1987654321')
    
    // Update budget
    await page.selectOption('select[name="budget"]', '$2M - $5M')
    
    // Save changes
    await page.click('button[type="submit"]')
    
    // Verify success message
    await expect(page.locator('text=Lead updated successfully')).toBeVisible()
    
    // Verify changes are reflected
    await expect(page.locator('text=+1987654321')).toBeVisible()
    await expect(page.locator('text=$2M - $5M')).toBeVisible()
  })

  test('should add interaction to lead', async ({ page }) => {
    await page.goto('/leads')
    
    // Click on first lead to view details
    await page.click('.lead-card:first-child')
    
    // Click add interaction button
    await page.click('text=Add Interaction')
    
    // Fill interaction form
    await page.selectOption('select[name="type"]', 'phone_call')
    await page.selectOption('select[name="method"]', 'outbound')
    await page.fill('textarea[name="notes"]', 'Called to discuss development opportunities')
    
    // Submit interaction
    await page.click('button[type="submit"]')
    
    // Verify interaction is added
    await expect(page.locator('text=Phone Call')).toBeVisible()
    await expect(page.locator('text=Called to discuss development opportunities')).toBeVisible()
  })

  test('should assign lead to team member', async ({ page }) => {
    await page.goto('/leads')
    
    // Click on first lead to view details
    await page.click('.lead-card:first-child')
    
    // Click assign button
    await page.click('text=Assign')
    
    // Select team member
    await page.selectOption('select[name="assignedTo"]', 'agent-1')
    
    // Save assignment
    await page.click('button[type="submit"]')
    
    // Verify assignment is updated
    await expect(page.locator('text=Assigned to Agent One')).toBeVisible()
  })
}) 