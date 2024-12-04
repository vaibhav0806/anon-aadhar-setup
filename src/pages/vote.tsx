'use client'

import { useState, useEffect } from 'react'
import { useReadContracts } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const CONTRACT_ADDRESS = "0xddAEfFb5eaD735E1Cc5Ce04b980958f82F2C373f" as const

const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateIndex",
                "type": "uint256"
            }
        ],
        "name": "getCandidate",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidateCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

export default function VotingApp() {
    const [candidates, setCandidates] = useState<{id: number, name: string, votes: number}[]>([])
    const [error, setError] = useState<string | null>(null)

    // Read candidate count and all candidates in one call
    const { data, error: contractError } = useReadContracts({
        contracts: [
            {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getCandidateCount',
            },
            // Placeholder for candidate fetching
        ]
    })

    // Effect to process contract data
    useEffect(() => {
        // Check for errors
        if (contractError) {
            setError(contractError.message)
            return
        }

        // If no data or candidate count is not retrieved
        if (!data || !data[0]?.result) return

        // Get candidate count
        const candidateCount = Number(data[0].result)

        // Prepare contracts for individual candidate fetching
        const candidateContracts = Array.from({ length: candidateCount }, (_, i) => ({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getCandidate',
            args: [BigInt(i)]
        }))

        // Fetch all candidates
        const fetchCandidates = async () => {
            try {
                const candidatesResult = await useReadContracts({
                    contracts: candidateContracts
                })

                if (candidatesResult.data) {
                    const formattedCandidates = candidatesResult.data.map((candidate, index) => ({
                        id: index,
                        name: candidate.result ? candidate.result[0] : '',
                        votes: candidate.result ? Number(candidate.result[1]) : 0
                    }))

                    setCandidates(formattedCandidates)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch candidates')
            }
        }

        fetchCandidates()
    }, [data, contractError])

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Voting Results</h1>
            
            {/* Error handling */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    {error}
                </div>
            )}

            {/* Candidates Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Votes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                            <TableCell>{candidate.name}</TableCell>
                            <TableCell>{candidate.votes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}