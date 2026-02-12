package Problems;

public class MajorityElement {
	
	public int majorityElement(int[] nums) {
		
		int count = 0; int max = 0;
		
		for(int n : nums) {
			if(count == 0) {
				max = n;
			}
			
			if(max == n) {
				count++;
			}
			
			else {
				count--;
			}
		}
		return max;
	}

	public static void main(String[] args) {
		
		int[] arr = new int[] {2,3,2,2};
		
		MajorityElement m = new MajorityElement();
		System.out.println(m.majorityElement(arr));

	}

}
