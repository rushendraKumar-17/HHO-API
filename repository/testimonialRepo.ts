import TestimonialModel from '../models/TestimonialModel';
import Testimonial from '../models/TestimonialModel';
import { TestimonialDocument } from '../types/testimonialType';
import crudRepository from './crudRepo';
class TestimonialRepository extends crudRepository<TestimonialDocument>{
    constructor() {
        super(Testimonial);
    }
    async getMatched(searchTerm: string): Promise<TestimonialDocument[]> {
        console.log("Into the repo");
        try {
            console.log("Search term:", searchTerm);
            let amountSearch: number | undefined;
            let dateSearch: Date | undefined;
            let isStringSearch = false;
    
            if (searchTerm) {
                // Check if the searchTerm is a number
                if (!isNaN(Number(searchTerm))) {
                    amountSearch = Number(searchTerm);
                    console.log("Detected search term as amount:", amountSearch);
                } else {
                    // Check if the searchTerm is a valid date
                    const parsedDate = new Date(searchTerm);
                    if (!isNaN(parsedDate.getTime())) {
                        dateSearch = parsedDate;
                        console.log("Detected search term as date:", dateSearch);
                    } else {
                        // If it's neither a number nor a date, treat it as a string
                        isStringSearch = true;
                        console.log("Detected search term as string:", searchTerm);
                    }
                }
            }
    
            const query: any = { $or: [] };
    
            // Add regex search for "purpose" only if searchTerm is a valid string
            if (isStringSearch) {
                query.$or.push({ purpose: { $regex: searchTerm, $options: "i" } });
            }
    
            // Add date search condition if a valid date was found
            if (dateSearch) {
                const startOfDay = new Date(dateSearch);
                startOfDay.setHours(0, 0, 0, 0);
    
                const endOfDay = new Date(dateSearch);
                endOfDay.setHours(23, 59, 59, 999);
    
                query.$or.push({ date: { $gte: startOfDay, $lt: endOfDay } });
            }
    
            // Add amount search condition if a valid number was found
            if (amountSearch !== undefined) {
                query.$or.push({ amount: { $eq: amountSearch } });
            }
    
            // If the $or array is empty, no valid conditions were added, so return an empty result
            if (query.$or.length === 0) {
                console.log("No valid search conditions provided.");
                return [];
            }
    
            console.log("Query formed:", query);
    
            // Run the query
            const ans = await TestimonialModel.find(query);
            console.log("Query executed successfully. Fetched results:", ans);
            
            return ans;
    
        } catch (error) {
            console.error("Error during query execution:", error);
            return null;
        }
    }
    
}

export default new TestimonialRepository();