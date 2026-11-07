import { AddCollection } from '@/components/admin/AddCollection'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'

export default function page() {
  return (
    <div className=''>

        <div className='flex justify-between items-end mb-4'>
            <div className=''>
            <h3 className='font-medium text-lg capitalize'>Add new collection</h3>
            </div>
        </div>

        <AddCollection />
    </div>
  )
}
